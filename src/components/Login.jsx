import { useState } from "react";
import Auth from "./Auth.jsx";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    // Główny handler logowania
    const pushLogin = async (e) => {
        e.preventDefault();



            // 2️⃣ Wyślij POST logowania z tokenem
            const response = await fetch(import.meta.env.VITE_LOGIN_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error("Login failed:", err);
                return;
            }

            const data = await response.json();
            console.log("Login success:", data);

            // Zachowaj tokeny w Auth (opcjonalne)
            Auth.setTokens(
                data.access || data.key,
                data.refresh || null,
            );

            // Przekieruj po zalogowaniu
            navigate("/");

    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    Vault77 Login
                </h2>

                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-gray-700 text-sm font-medium mb-2"
                    >
                        Email
                    </label>
                    <input
                        type="text"
                        id="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-gray-700 text-sm font-medium mb-2"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    onClick={(e) => pushLogin(e)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
