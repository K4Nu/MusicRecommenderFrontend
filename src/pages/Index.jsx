import Auth from "../utils/Auth.js";
import Navbar from "../components/layout/Navbar.jsx";
import { useEffect, useState } from "react";

const Index = () => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!Auth.isAuthenticated()) return;
        fetchColdStartSongs();
    }, []);

    const fetchColdStartSongs = async () => {
        try {
            const jwt = localStorage.getItem("access_token");
            const response = await fetch("http://127.0.0.1:8000/cold_start/", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
            });

            const data = await response.json();

            if (data.tracks && Array.isArray(data.tracks)) {
                setSongs(data.tracks);
            } else {
                setSongs([]);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch songs:", error);
            setLoading(false);
        }
    };

    // ================================
    // INTERACTIONS
    // ================================
    const sendInteraction = async (song, action) => {
        try {
            const jwt = localStorage.getItem("access_token");

            await fetch("http://127.0.0.1:8000/onboarding/interact/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify({
                    cold_start_track_id: song.id,
                    action, // LIKE | SKIP | NOT_MY_STYLE
                }),
            });
        } catch (err) {
            console.error("Failed to send interaction:", err);
        }
    };

    const handleNext = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            setSongs([]);
        }
    };

    const handleLike = async () => {
        const song = songs[currentIndex];
        await sendInteraction(song, "LIKE");
        handleNext();
    };

    const handleSkip = async () => {
        const song = songs[currentIndex];
        await sendInteraction(song, "SKIP");
        handleNext();
    };

    const handleNotMyStyle = async () => {
        const song = songs[currentIndex];
        await sendInteraction(song, "NOT_MY_STYLE");
        handleNext();
    };

    if (!Auth.isAuthenticated()) return null;

    const currentSong = songs[currentIndex];
    const showSongCard = !loading && songs.length > 0;

    return (
        <>
            <Navbar />

            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                {/* CONNECT ACCOUNTS */}
                {!showSongCard && !loading && (
                    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                            Connect Your Accounts
                        </h1>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={Auth.spotifyConnect}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl"
                            >
                                Connect Spotify
                            </button>
                            <button
                                onClick={Auth.youtubeConnect}
                                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl"
                            >
                                Connect YouTube
                            </button>
                        </div>
                    </div>
                )}

                {/* ONBOARDING CARD */}
                {showSongCard && (
                    <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-lg">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Discover Your Music
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {currentIndex + 1} of {songs.length}
                            </p>
                        </div>

                        {/* Track info */}
                        <div className="mb-4 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {currentSong.track_name}
                            </h3>
                            <p className="text-gray-600">
                                {currentSong.artists.join(", ")}
                            </p>
                        </div>

                        {/* Spotify Embed */}
                        <div className="mb-6 rounded-xl overflow-hidden">
                            <iframe
                                src={currentSong.embed_url}
                                width="100%"
                                height="352"
                                frameBorder="0"
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-center gap-6">
                            {/* NOT MY STYLE */}
                            <button
                                onClick={handleNotMyStyle}
                                className="w-14 h-14 bg-yellow-100 hover:bg-yellow-200 rounded-full flex items-center justify-center shadow"
                                title="Not my style"
                            >
                                😐
                            </button>

                            {/* SKIP */}
                            <button
                                onClick={handleSkip}
                                className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center shadow"
                                title="Skip"
                            >
                                ❌
                            </button>

                            {/* LIKE */}
                            <button
                                onClick={handleLike}
                                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow"
                                title="Like"
                            >
                                ❤️
                            </button>
                        </div>
                    </div>
                )}

                {/* LOADING */}
                {loading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto" />
                        <p className="mt-4 text-gray-600">
                            Loading your music taste...
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Index;
