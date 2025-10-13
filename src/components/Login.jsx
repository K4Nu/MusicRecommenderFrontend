import {useState} from "react";
import Auth from "./Auth.jsx";
import {useNavigate} from "react-router";

const Login = () => {
    const login_URL=import.meta.env.VITE_LOGIN_URL;
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate=useNavigate();
    const pushLogin = async (e) => {
        e.preventDefault(); // Prevent form refresh

        try {
            const response = await fetch(login_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,  // Use "username" if your backend expects it
                    password: password,
                }),
            });

            if (!response.ok) {
                // Handle 4xx/5xx responses
                const errorData = await response.json();
                console.error("Login failed:", errorData);
                return;
            }

            const data = await response.json();
            console.log("Login success:", data);

            // Save token (if returned)
            Auth.setTokens(
                data.access || data.key,           // access token
                data.refresh || null,              // refresh token
                data.user.first_name || null,
            );
            navigate('/');

            // Optionally navigate to another page here

        } catch (error) {
            console.error("Network error:", error);
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Vault77 Login</h2>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
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
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
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
                    onClick={(e)=>pushLogin(e)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
