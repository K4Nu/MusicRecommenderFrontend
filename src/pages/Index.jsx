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
            const response = await fetch('http://127.0.0.1:8000/cold_start/', {
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${jwt}`,
                }
            });
            const data = await response.json();
            setSongs(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            setLoading(false);
        }
    };

    const handleSkip = () => {
        if (currentIndex < songs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setSongs([]);
        }
    };

    const handleLike = () => {
        const song = songs[currentIndex];
        console.log('Liked:', song.track_name);
        handleSkip();
    };

    if (!Auth.isAuthenticated()) return null;

    const currentSong = songs[currentIndex];
    const showSongCard = !loading && songs.length > 0;

    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                {/* Connection Card */}
                {!showSongCard && (
                    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
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
                        </div>
                    </div>
                )}

                {/* Song Discovery Card */}
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

                        {/* Song Info */}
                        <div className="mb-4 text-center">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
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

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-6">
                            {/* Skip Button (X) */}
                            <button
                                onClick={handleSkip}
                                className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition duration-200 shadow-md hover:shadow-lg"
                                aria-label="Skip"
                            >
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Like Button (Heart) */}
                            <button
                                onClick={handleLike}
                                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition duration-200 shadow-md hover:shadow-lg"
                                aria-label="Like"
                            >
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading your personalized songs...</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Index;