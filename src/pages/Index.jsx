import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Auth from "../utils/Auth.js";
import TrackRow from "../components/layout/TrackRow.jsx";

const API_BASE_URL = "http://127.0.0.1:8000";

const Index = () => {
    const navigate = useNavigate();

    if (!Auth.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const [loading, setLoading] = useState(true);
    const [homeData, setHomeData] = useState(null);
    const [error, setError] = useState(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const toTitleCase = (str) => {
        if (!str) return "";
        return str
            .split(" ")
            .map((word) => {
                if (word === word.toUpperCase() || word.includes("&")) {
                    return word;
                }
                return (
                    word.charAt(0).toUpperCase() +
                    word.slice(1).toLowerCase()
                );
            })
            .join(" ");
    };

    const loadHome = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/home/`, {
                headers: { ...Auth.getAuthHeader() },
            });

            if (res.status === 403) {
                navigate("/onboarding", { replace: true });
                return;
            }

            if (!res.ok) throw new Error("Failed to fetch home data");

            const data = await res.json();
            setHomeData(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load home data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHome();
    }, []);

    const openModal = (item) => {
        setIframeLoaded(false);
        setSelectedItem(item);
    };

    const closeModal = () => {
        setSelectedItem(null);
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const sendFeedback = async (action) => {
        if (!selectedItem || selectedItem.user_feedback) return;

        setSubmitting(true);

        try {
            await fetch(`${API_BASE_URL}/api/feedback/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...Auth.getAuthHeader(),
                },
                body: JSON.stringify({
                    recommendation_item_id: selectedItem.id,
                    action,
                }),
            });

            setHomeData((prev) => {
                const updateItems = (items) =>
                    items.map((i) =>
                        i.id === selectedItem.id
                            ? { ...i, user_feedback: action }
                            : i
                    );

                const updatedTop = updateItems(prev.top_items);
                const updatedLight = updateItems(prev.lighter_items);

                const allRated = [...updatedTop, ...updatedLight]
                    .every((i) => i.user_feedback);

                if (allRated) {
                    setTimeout(() => {
                        setLoading(true);
                        loadHome();
                    }, 200);
                }

                return {
                    ...prev,
                    top_items: updatedTop,
                    lighter_items: updatedLight,
                };
            });

            closeModal();
        } catch (err) {
            console.error("Feedback error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100">
                    <p className="text-gray-500">
                        Generating fresh recommendations…
                    </p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100">
                    <p className="text-red-500">{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="min-h-[100dvh] bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-14">

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            Welcome back 👋
                        </h1>
                        <p className="text-gray-500 mt-2">
                            Here are your personalized music recommendations
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
                            Your Music Profile
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {homeData?.profile_tags?.slice(0, 5).map((tag) => (
                                <div
                                    key={tag.tag_id}
                                    className="bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-medium py-2 px-3 rounded-xl text-center truncate"
                                >
                                    {toTitleCase(tag.tag_name)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                            Top Picks For You
                        </h2>

                        <div className="space-y-4">
                            {homeData?.top_items?.map((item) => (
                                <TrackRow
                                    key={item.id}
                                    item={item}
                                    highlight
                                    onClick={() => openModal(item)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                            More Recommendations
                        </h2>

                        <div className="space-y-4">
                            {homeData?.lighter_items?.map((item) => (
                                <TrackRow
                                    key={item.id}
                                    item={item}
                                    onClick={() => openModal(item)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedItem && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 px-4"
                    onClick={closeModal}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

                    <div
                        className="relative bg-white rounded-3xl w-full max-w-lg p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-5 text-gray-400 hover:text-gray-600"
                            onClick={closeModal}
                        >
                            ✕
                        </button>

                        <h3 className="text-lg font-semibold mb-5 text-gray-900">
                            {selectedItem.track_name}
                        </h3>

                        <div className="relative mb-4">
                            {!iframeLoaded && (
                                <div className="absolute inset-0 bg-gray-200 rounded-xl animate-pulse" />
                            )}

                            <iframe
                                src={selectedItem.embed_url}
                                className={`rounded-xl w-full h-[152px] transition-opacity duration-300 ${
                                    iframeLoaded ? "opacity-100" : "opacity-0"
                                }`}
                                allow="autoplay; encrypted-media"
                                loading="lazy"
                                onLoad={() => setIframeLoaded(true)}
                            />
                        </div>

                        {/* 🔥 WHY THIS SECTION */}
                        {selectedItem.reason && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                                <h4 className="text-sm font-semibold text-gray-700">
                                    💡 Why this recommendation?
                                </h4>

                                {selectedItem.reason.signals?.matched_tags?.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                                            Matches your taste
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedItem.reason.signals.matched_tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedItem.reason.signals?.similar_to?.length > 0 && (
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
                                            Similar to
                                        </p>
                                        <ul className="space-y-1 text-sm text-gray-600">
                                            {selectedItem.reason.signals.similar_to.map((sim, idx) => (
                                                <li key={idx}>
                                                    🎵 {sim.track_name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-2 border-t border-gray-200 text-xs text-gray-400">
                                    Strategy:{" "}
                                    <span className="font-medium text-gray-500 capitalize">
                                        {selectedItem.reason.strategy?.toLowerCase().replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-10 text-3xl mt-6">
                            <button
                                disabled={submitting || selectedItem.user_feedback}
                                className="hover:scale-125 transition-transform duration-150 disabled:opacity-40"
                                onClick={() => sendFeedback("DISLIKE")}
                            >
                                👎
                            </button>

                            <button
                                disabled={submitting || selectedItem.user_feedback}
                                className="hover:scale-125 transition-transform duration-150 disabled:opacity-40"
                                onClick={() => sendFeedback("LIKE")}
                            >
                                ❤️
                            </button>
                        </div>

                        {submitting && (
                            <p className="text-center text-sm text-gray-400 mt-4">
                                Saving your feedback...
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Index;