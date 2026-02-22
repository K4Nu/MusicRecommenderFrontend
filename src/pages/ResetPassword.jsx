import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        const resp = await fetch(
            "http://127.0.0.1:8000/auth/users/reset_password_confirm/",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid,
                    token,
                    new_password: password,
                }),
            }
        );

        if (resp.ok) {
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } else {
            const data = await resp.json().catch(() => null);
            setError(
                data?.new_password?.[0] ||
                data?.token?.[0] ||
                "Password reset failed"
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 p-6">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.02]">

                {!success ? (
                    <>
                        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                            Set New Password
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-md"
                            >
                                Change Password
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-green-600 mb-4">
                            Password changed successfully ✅
                        </h2>
                        <p className="text-gray-600">
                            Redirecting to login...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}