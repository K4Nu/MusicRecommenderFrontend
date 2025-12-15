import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (!email || !password1 || !password2) {
            setError("Wypełnij wszystkie pola.");
            return;
        }

        if (password1.length < 8) {
            setError("Hasło musi mieć co najmniej 8 znaków.");
            return;
        }

        if (password1 !== password2) {
            setError("Hasła nie są takie same.");
            return;
        }

        try {
            const response = await fetch(import.meta.env.VITE_REGISTER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password1, password2 }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                setError(data?.error || "Rejestracja nie powiodła się.");
                return;
            }

            // jeśli sukces
            setSuccess(true);
            setEmail("");
            setPassword1("");
            setPassword2("");

            // automatyczne przekierowanie po 2 sekundach
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            console.error(err);
            setError("Wystąpił błąd podczas rejestracji.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-teal-500 to-indigo-600 p-6">
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01]">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    <span className="text-blue-600">Recommender</span> Register
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password1" className="block text-gray-700 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password1"
                            placeholder="Minimum 8 znaków"
                            value={password1}
                            onChange={(e) => setPassword1(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password2" className="block text-gray-700 text-sm font-semibold mb-2">
                            Repeat password
                        </label>
                        <input
                            type="password"
                            id="password2"
                            placeholder="Powtórz hasło"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100 animate-fade-in">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-sm text-green-700 bg-green-50 p-2 rounded-md border border-green-200 animate-fade-in">
                            🎉 Succesful register! <br /> Redirecting to login
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 focus:ring-4 focus:ring-teal-300 transition-all shadow-md"
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    You have an account?{" "}
                    <a href="/login" className="text-teal-600 hover:underline font-medium">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
