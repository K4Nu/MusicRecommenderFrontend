import { useState } from "react";
import Auth from "../utils/Auth.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // dostosuj ścieżkę

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();          // <-- bierzemy funkcję z kontekstu

    const pushLogin = async (e) => {
        e.preventDefault();

        const response = await fetch(import.meta.env.VITE_LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const text = await response.text().catch(() => "");
            console.error("Login failed. Status:", response.status);
            console.error("Raw response body:", text);
            try {
                const json = JSON.parse(text);
                console.error("Parsed JSON:", json);
            } catch (e) {
                console.log(e);
            }
            return;
        }

        const data = await response.json();
        console.log("Login success:", data);

        const access = data.access || data.key;
        const refresh = data.refresh || null;


        await login(access, refresh);

        navigate("/");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-6">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02]">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    <span className="text-blue-600">Recommender</span> Login
                </h2>

                <form onSubmit={pushLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-gray-700 text-sm font-semibold mb-2"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-gray-700 text-sm font-semibold mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-md"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don’t have an account?{" "}
                    <a
                        href="/register"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
