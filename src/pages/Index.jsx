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
        localStorage.setItem(ONBOARDING_BUFFER_KEY, JSON.stringify(eventBuffer));
    }, [eventBuffer]);

    useEffect(() => {
        localStorage.setItem(ONBOARDING_TRACKS_KEY, JSON.stringify(songs));
    }, [songs]);

    useEffect(() => {
        localStorage.setItem(
            ONBOARDING_POSITION_KEY,
            currentIndex.toString()
        );
    }, [currentIndex]);

    // ================================
    // INITIAL LOAD
    // ================================
    useEffect(() => {
        if (!Auth.isAuthenticated()) return;
        if (songs.length > 0) {
            setLoading(false);
            return;
        }
        checkSetupStatus();
    }, []);

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

            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                {needsIntegration && !showSongCard && (
                    <div className="bg-white p-8 rounded-2xl shadow text-center">
                        <h1 className="text-xl font-semibold mb-4">
                            Connect accounts
                        </h1>
                        <button onClick={Auth.spotifyConnect}>Spotify</button>
                        <button onClick={Auth.youtubeConnect}>YouTube</button>
                    </div>
                )}

                {showSongCard && (
                    <div className="bg-white p-6 rounded-3xl shadow-xl w-full max-w-lg">
                        <h2 className="text-center font-bold text-xl mb-2">
                            Discover Your Music
                        </h2>
                        <p className="text-center text-sm text-gray-500 mb-4">
                            {currentIndex + 1} / {songs.length}
                        </p>

                        <h3 className="text-center font-semibold">
                            {currentSong.track_name}
                        </h3>
                        <p className="text-center text-gray-600 mb-4">
                            {currentSong.artists.join(", ")}
                        </p>

                        <iframe
                            src={currentSong.embed_url}
                            width="100%"
                            height="352"
                            allow="autoplay; encrypted-media"
                            className="rounded-xl mb-4"
                        />

                        {needsMoreLikes && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-center text-sm">
                                ❤️ Polub jeszcze{" "}
                                <strong>{likesMissing}</strong>{" "}
                                {likesMissing === 1 ? "utwór" : "utwory"},
                                aby zakończyć onboarding
                            </div>
                        )}

                        <div className="flex justify-center gap-6">
                            <button
                                disabled={needsMoreLikes}
                                className={needsMoreLikes ? "opacity-30" : ""}
                                onClick={handleNotMyStyle}
                            >
                                😐
                            </button>
                            <button
                                disabled={needsMoreLikes}
                                className={needsMoreLikes ? "opacity-30" : ""}
                                onClick={handleSkip}
                            >
                                ❌
                            </button>
                            <button onClick={handleLike}>❤️</button>
                        </div>
                    </div>
                )}

                {loading && <p>Loading…</p>}
            </div>
        </>
    );
};

export default Index;
