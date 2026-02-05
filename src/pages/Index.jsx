import Auth from "../utils/Auth.js";
import Navbar from "../components/layout/Navbar.jsx";
import { useEffect, useState } from "react";

const ONBOARDING_BUFFER_KEY = "onboarding_buffer";
const ONBOARDING_TRACKS_KEY = "onboarding_tracks";
const ONBOARDING_POSITION_KEY = "onboarding_position";

const FLUSH_THRESHOLD = 3;
const REQUIRED_LIKES = 3;
const API_BASE_URL = "http://127.0.0.1:8000";

const Index = () => {
    // ================================
    // STATE
    // ================================
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

    const [likesCount, setLikesCount] = useState(0);
    const needsMoreLikes = likesCount < REQUIRED_LIKES;

    // 🔥 anty-spam / double click lock
    const [locked, setLocked] = useState(false);

    // ================================
    // PERSIST
    // ================================
    useEffect(() => {
        localStorage.setItem(ONBOARDING_TRACKS_KEY, JSON.stringify(songs));
    }, [songs]);

    useEffect(() => {
        localStorage.setItem(
            ONBOARDING_POSITION_KEY,
            currentIndex.toString()
        );
    }, [currentIndex]);

    useEffect(() => {
        localStorage.setItem(
            ONBOARDING_BUFFER_KEY,
            JSON.stringify(eventBuffer)
        );
    }, [eventBuffer]);

    // ================================
    // INITIAL LOAD
    // ================================
    useEffect(() => {
        if (!Auth.isAuthenticated()) return;
        checkSetupStatus();
    }, []);

    const checkSetupStatus = async () => {
        const jwt = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/cold_start/`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });

        const data = await res.json();

        if (data.needs_onboarding && data.tracks?.length) {
            setSongs(data.tracks);
            setCurrentIndex(0);
            setLikesCount(0);
            setNeedsIntegration(false);
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
    };

    const reloadColdStartTracks = async () => {
        const jwt = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/cold_start/`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });

        const data = await res.json();

        if (data.tracks?.length) {
            setSongs(data.tracks);
            setCurrentIndex(0);
            localStorage.setItem(
                ONBOARDING_TRACKS_KEY,
                JSON.stringify(data.tracks)
            );
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
        setEventBuffer([]);

        if (data.status === "onboarding_completed") {
            clearOnboardingData();
            window.location.href = "/dashboard";
            return;
        }

        if (
            data.stats &&
            data.stats.total_count >= 7 &&
            data.stats.likes_count < REQUIRED_LIKES
        ) {
            setLikesCount(data.stats.likes_count);
            await reloadColdStartTracks();
        }
    };

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

            if (action === "LIKE") {
                setLikesCount(c => c + 1);
            }

            if (updated.length >= FLUSH_THRESHOLD) {
                flushOnboardingEvents(updated);
                return [];
            }

            return updated;
        });
    };

    const handleNext = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            flushOnboardingEvents();
        }
    };

    // 🔥 POPRAWIONE HANDLERY (event → next)
    const handleNotMyStyle = () => {
        if (locked) return;
        setLocked(true);
        registerInteraction(songs[currentIndex], "NOT_MY_STYLE");
        handleNext();
        setTimeout(() => setLocked(false), 200);
    };

    const handleSkip = () => {
        if (locked) return;
        setLocked(true);
        registerInteraction(songs[currentIndex], "SKIP");
        handleNext();
        setTimeout(() => setLocked(false), 200);
    };

    const handleLike = () => {
        if (locked) return;
        setLocked(true);
        registerInteraction(songs[currentIndex], "LIKE");
        handleNext();
        setTimeout(() => setLocked(false), 200);
    };

    // ================================
    // RENDER
    // ================================
    if (!Auth.isAuthenticated() || loading) return null;

    const currentSong = songs[currentIndex];

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        {currentIndex + 1}/{songs.length} · Likes {likesCount}/{REQUIRED_LIKES}
                    </p>

                    <h3 className="text-lg font-semibold">
                        {currentSong.track_name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {currentSong.artists.join(", ")}
                    </p>

                    <iframe
                        src={currentSong.embed_url}
                        width="100%"
                        height="352"
                        className="rounded-xl mb-6"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />

                    <div className="flex justify-center gap-6 text-2xl">
                        <button onClick={handleNotMyStyle}>😐</button>
                        <button onClick={handleSkip}>❌</button>
                        <button onClick={handleLike}>❤️</button>
                    </div>

                    {needsMoreLikes && (
                        <p className="text-sm text-red-500 mt-4">
                            Like {REQUIRED_LIKES - likesCount} more track(s) to continue
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Index;
