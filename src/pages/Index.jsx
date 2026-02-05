import Auth from "../utils/Auth.js";
import Navbar from "../components/layout/Navbar.jsx";
import { useEffect, useState } from "react";

const ONBOARDING_BUFFER_KEY = "onboarding_buffer";
const ONBOARDING_TRACKS_KEY = "onboarding_tracks";
const ONBOARDING_POSITION_KEY = "onboarding_position";
const FLUSH_THRESHOLD = 3;
const API_BASE_URL = "http://127.0.0.1:8000";

const Index = () => {
    const [songs, setSongs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(ONBOARDING_TRACKS_KEY)) || [];
        } catch {
            return [];
        }
    });

    const [currentIndex, setCurrentIndex] = useState(() => {
        const v = localStorage.getItem(ONBOARDING_POSITION_KEY);
        return v ? parseInt(v, 10) : 0;
    });

    const [eventBuffer, setEventBuffer] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(ONBOARDING_BUFFER_KEY)) || [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(true);
    const [needsIntegration, setNeedsIntegration] = useState(false);

    // 🔥 nowy stan
    const [needsMoreLikes, setNeedsMoreLikes] = useState(false);
    const [likesMissing, setLikesMissing] = useState(0);

    // ================================
    // PERSIST STATE
    // ================================
    useEffect(() => {
        if (!Auth.isAuthenticated()) return;
    })


    const checkSetupStatus = async () => {
        try {
            const jwt = localStorage.getItem("access_token");

            const res = await fetch(`${API_BASE_URL}/cold_start/`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const data = await res.json();
            console.log("🔍 setup:", data);

            if (
                data.needs_onboarding &&
                Array.isArray(data.tracks) &&
                data.tracks.length > 0
            ) {
                setSongs(data.tracks);
                setNeedsIntegration(data.needs_integration);
                setLoading(false);
                return;
            }

            if (data.needs_integration) {
                setNeedsIntegration(true);
                setLoading(false);
                return;
            }

            clearOnboardingData();
            window.location.href = "/dashboard";
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const clearOnboardingData = () => {
        localStorage.removeItem(ONBOARDING_BUFFER_KEY);
        localStorage.removeItem(ONBOARDING_TRACKS_KEY);
        localStorage.removeItem(ONBOARDING_POSITION_KEY);
    };

    // ================================
    // FLUSH EVENTS
    // ================================
    const flushOnboardingEvents = async (eventsToSend = eventBuffer) => {
        if (!eventsToSend.length) return;

        try {
            const jwt = localStorage.getItem("access_token");

            const res = await fetch(`${API_BASE_URL}/api/onboarding/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    events: eventsToSend.map(e => ({
                        cold_start_track_id: e.coldStartTrackId,
                        action: e.action,
                        position: e.position,
                    })),
                }),
            });

            const data = await res.json();
            console.log("✅ onboarding response:", data);

            setEventBuffer([]);

            if (data.status === "onboarding_completed") {
                clearOnboardingData();
                window.location.href = "/dashboard";
                return;
            }

            // 🔥 KLUCZOWA LOGIKA
            if (
                data.stats &&
                data.stats.total_count >= 7 &&
                data.stats.likes_count < 3
            ) {
                setNeedsMoreLikes(true);
                setLikesMissing(3 - data.stats.likes_count);
            }
        } catch (e) {
            console.error("flush error:", e);
        }
    };

    // ================================
    // AUTO FLUSH ON TAB HIDE
    // ================================
    useEffect(() => {
        const handler = () => {
            if (
                document.visibilityState === "hidden" &&
                eventBuffer.length > 0
            ) {
                flushOnboardingEvents();
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () =>
            document.removeEventListener("visibilitychange", handler);
    }, [eventBuffer]);

    // ================================
    // INTERACTIONS
    // ================================
    const registerInteraction = (song, action) => {
        setEventBuffer(prev => {
            const updated = [
                ...prev,
                {
                    coldStartTrackId: song.id,
                    action,
                    position: currentIndex + 1,
                },
            ];

            if (updated.length >= FLUSH_THRESHOLD) {
                flushOnboardingEvents(updated);
                return [];
            }
            return updated;
        });
    };

    const handleNext = () => {
        // ❌ nie pozwól zakończyć jeśli brakuje LIKE
        if (needsMoreLikes && currentIndex >= songs.length - 1) return;

        if (currentIndex < songs.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            flushOnboardingEvents();
        }
    };

    const handleLike = () => {
        registerInteraction(songs[currentIndex], "LIKE");
        handleNext();
    };

    const handleSkip = () => {
        registerInteraction(songs[currentIndex], "SKIP");
        handleNext();
    };

    const handleNotMyStyle = () => {
        registerInteraction(songs[currentIndex], "NOT_MY_STYLE");
        handleNext();
    };

    // ================================
    // RENDER
    // ================================
    if (!Auth.isAuthenticated()) return null;

    const currentSong = songs[currentIndex];
    const showSongCard = !loading && songs.length > 0;

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                    <h1>You are authenticated</h1>
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                        Connect Your Accounts
                    </h1>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={Auth.spotifyConnect}
                            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition duration-200"
                        >
                            Connect Spotify Account
                        </button>
                        <button
                            onClick={Auth.youtubeConnect}
                            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition duration-200"
                        >
                            Connect YouTube Account
                        </button>
                        <button
                            onClick={Auth.lastFmConnect}
                            className="w-full py-3 bg-[#d51007] hover:bg-[#b40d06] text-white font-medium rounded-xl transition duration-200"
                        >
                            Connect Last.fm Account
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Index;
