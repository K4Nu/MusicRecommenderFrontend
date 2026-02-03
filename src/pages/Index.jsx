import Auth from "../utils/Auth.js";
import Navbar from "../components/layout/Navbar.jsx";
import { useEffect, useState } from "react";

const Index = () => {
    const [songs, setSongs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!Auth.isAuthenticated()) return;
    })


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