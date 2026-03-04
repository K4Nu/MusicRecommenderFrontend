import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar.jsx";
import Auth from "../utils/Auth.js";

const API_BASE_URL = "http://127.0.0.1:8000";
const REQUIRED_LIKES = 3;

const Onboarding = () => {
    const navigate = useNavigate();

    // ================================
    // STATE
    // ================================
    const [tracks, setTracks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [totalInteracted, setTotalInteracted] = useState(0);
    const [loading, setLoading] = useState(true);
    const [interacting, setInteracting] = useState(false);

    // ================================
    // HARD GUARDS
    // ================================
    const isFetching = useRef(false);
    const hasMounted = useRef(false);
    const finished = useRef(false);

    // ================================
    // INITIAL LOAD (ONCE)
    // ================================
    useEffect(() => {
        console.log("🟢 Onboarding MOUNT");

        if (!Auth.isAuthenticated()) {
            navigate("/login", { replace: true });
            return;
        }

        loadColdStart();

        return () => {
            console.log("🔴 Onboarding UNMOUNT");
            finished.current = true;
        };
    }, []);

    // ================================
    // LOAD COLD START
    // ================================
    const loadColdStart = async () => {
        if (isFetching.current || finished.current) return;

        isFetching.current = true;
        setLoading(true);

        const jwt = localStorage.getItem("access_token");

        try {
            const res = await fetch(`${API_BASE_URL}/cold_start/`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const data = await res.json();
            console.log("📥 cold_start:", data);

            if (finished.current) return;

            // onboarding already done → escape hatch
            if (!data.needs_onboarding) {
                console.log("✅ onboarding already completed");
                navigate("/", { replace: true });
                return;
            }

            setTracks(data.tracks || []);
            setCurrentIndex(0);
            setLikesCount(data.stats?.likes_count ?? 0);
        } catch (err) {
            console.error("❌ cold_start error:", err);
        } finally {
            isFetching.current = false;
            setLoading(false);
        }
    };

    // ================================
    // SEND EVENT
    // ================================
    const sendEvent = async (trackId, action, position) => {
        if (finished.current) return true;

        const jwt = localStorage.getItem("access_token");

        const res = await fetch(`${API_BASE_URL}/api/onboarding/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                events: [
                    {
                        cold_start_track_id: trackId,
                        action,
                        position,
                    },
                ],
            }),
        });

        const data = await res.json();
        console.log("📤 onboarding:", data);

        if (data.stats?.likes_count !== undefined) {
            setLikesCount(data.stats.likes_count);
        }

        if (
            data.status === "onboarding_completed" ||
            data.status === "already_completed"
        ) {
            console.log("🏁 onboarding finished");
            finished.current = true;
            navigate("/", { replace: true });
            return true;
        }

        return false;
    };

    // ================================
    // USER INTERACTION
    // ================================
    const interact = async (action) => {
        if (interacting || finished.current) return;

        setInteracting(true);

        const track = tracks[currentIndex];
        const position = totalInteracted + 1;

        const completed = await sendEvent(track.id, action, position);

        if (completed) return;

        setTotalInteracted((v) => v + 1);

        // next track in batch
        if (currentIndex < tracks.length - 1) {
            setCurrentIndex((v) => v + 1);
            setInteracting(false);
            return;
        }

        // do not fetch if condition reached
        if (likesCount + (action === "LIKE" ? 1 : 0) >= REQUIRED_LIKES) {
            return;
        }

        setInteracting(false);
        await loadColdStart();
    };

    // ================================
    // RENDER
    // ================================
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <p>Preparing your recommendations…</p>
                </div>
            </>
        );
    }

    if (!tracks.length) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <p>No tracks available.</p>
                </div>
            </>
        );
    }

    const track = tracks[currentIndex];

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-xl w-full max-w-lg text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        Likes {likesCount}/{REQUIRED_LIKES}
                    </p>

                    <h3 className="text-lg font-semibold">
                        {track.track_name}
                    </h3>

                    <p className="text-gray-600 mb-4">
                        {track.artists.join(", ")}
                    </p>

                    <iframe
                        src={track.embed_url}
                        width="100%"
                        height="352"
                        className="rounded-xl mb-6"
                        allow="autoplay; encrypted-media"
                    />

                    <div className="flex justify-center gap-6 text-2xl">
                        <button onClick={() => interact("NOT_MY_STYLE")}>😐</button>
                        <button onClick={() => interact("SKIP")}>❌</button>
                        <button onClick={() => interact("LIKE")}>❤️</button>
                    </div>

                    {interacting && (
                        <p className="text-xs text-gray-400 mt-2">
                            Processing…
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Onboarding;
