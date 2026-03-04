import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Auth from "../utils/Auth.js";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function Settings() {
    const navigate = useNavigate();

    if (!Auth.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const [user, setUser] = useState(null);
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [disconnecting, setDisconnecting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [password, setPassword] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // 🔵 PASSWORD RESET STATE
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/home/`, {
                    headers: { ...Auth.getAuthHeader() },
                });
                const data = await res.json();
                setSpotifyConnected(data?.is_spotify_connected);
            } catch (err) {
                console.error(err);
            }

            try {
                const resUser = await fetch(`${API_BASE_URL}/auth/users/me/`, {
                    headers: { ...Auth.getAuthHeader() },
                });
                const userData = await resUser.json();
                setUser(userData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleLogout = async () => {
        await Auth.logout();
        navigate("/login");
    };

    // 🔵 SEND PASSWORD RESET
    const sendPasswordReset = async () => {
        if (!user?.email) return;

        setResetLoading(true);
        setResetSent(false);

        try {
            await fetch(`${API_BASE_URL}/auth/users/reset_password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                }),
            });

            setResetSent(true);
        } catch (err) {
            console.error(err);
        } finally {
            setResetLoading(false);
        }
    };

    const disconnectSpotify = async () => {
        setDisconnecting(true);

        try {
            await fetch(`${API_BASE_URL}/auth/spotify/disconnect/`, {
                method: "DELETE",
                headers: { ...Auth.getAuthHeader() },
            });

            setSpotifyConnected(false);
            setShowDisconnectModal(false);
        } catch (err) {
            console.error(err);
        } finally {
            setDisconnecting(false);
        }
    };

    const deleteAccount = async () => {
        setDeleting(true);
        setDeleteError("");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/delete-account/`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...Auth.getAuthHeader(),
                },
                body: JSON.stringify({ password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setDeleteError(data?.detail || "Incorrect password.");
                setDeleting(false);
                return;
            }

            await Auth.logout();
            navigate("/login");
        } catch (err) {
            setDeleteError("Something went wrong.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[100dvh] bg-gray-50">
                    <p className="text-gray-500">Loading settings...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">

                    <h1 className="text-3xl font-bold text-gray-900">
                        Account Settings
                    </h1>

                    {/* ACCOUNT INFO */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Account Information
                        </h2>

                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* SPOTIFY */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Spotify
                        </h2>

                        {spotifyConnected ? (
                            <div className="flex items-center justify-between">
                                <p className="text-green-600 font-medium">
                                    Connected ✅
                                </p>
                                <button
                                    onClick={() => setShowDisconnectModal(true)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-gray-500">
                                    Not connected
                                </p>
                                <button
                                    onClick={Auth.spotifyConnect}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                >
                                    Connect Spotify
                                </button>
                            </div>
                        )}
                    </div>

                    {/* SECURITY */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Security
                        </h2>

                        <div className="flex gap-4">
                            <button
                                onClick={sendPasswordReset}
                                disabled={resetLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {resetLoading ? "Sending..." : "Change Password"}
                            </button>

                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition"
                            >
                                Logout
                            </button>
                        </div>

                        {resetSent && (
                            <p className="text-sm text-green-600 mt-3">
                                Password reset email sent to {user.email}
                            </p>
                        )}
                    </div>

                    {/* DANGER ZONE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-red-600">
                            Danger Zone
                        </h2>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>

            {/* SPOTIFY DISCONNECT MODAL */}
            {showDisconnectModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
                     onClick={() => setShowDisconnectModal(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-xl"
                         onClick={(e) => e.stopPropagation()}>

                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Disconnect Spotify?
                        </h3>

                        <p className="text-sm text-gray-600 mb-6">
                            This will remove your Spotify account connection and stop data syncing.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDisconnectModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                disabled={disconnecting}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={disconnectSpotify}
                                disabled={disconnecting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                            >
                                {disconnecting ? "Disconnecting..." : "Disconnect"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE ACCOUNT MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
                     onClick={() => setShowDeleteModal(false)}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    <div className="relative bg-white rounded-3xl w-full max-w-md p-6 shadow-xl"
                         onClick={(e) => e.stopPropagation()}>

                        <h3 className="text-lg font-semibold text-red-600 mb-4">
                            Delete Account
                        </h3>

                        <p className="text-sm text-gray-600 mb-4">
                            This action is permanent. Enter your password to confirm.
                        </p>

                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setDeleteError("");
                            }}
                            className={`w-full px-4 py-2 border rounded-lg transition mb-2
                                ${deleteError
                                ? "border-red-500 focus:ring-2 focus:ring-red-500"
                                : "border-gray-300 focus:ring-2 focus:ring-red-500"
                            }`}
                        />

                        {deleteError && (
                            <p className="text-sm text-red-600 mb-4">
                                {deleteError}
                            </p>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={deleteAccount}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}