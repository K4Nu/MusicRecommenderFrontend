import Auth from "../utils/Auth.js";
import Navbar from "../components/layout/Navbar.jsx";
import { useEffect } from "react";
import { getRecommendations } from "../api/recommendations";

const Index = () => {

    useEffect(() => {
        if (!Auth.isAuthenticated()) return;

        getRecommendations()
            .then(res => {
                console.log("Rekomendacje:", res.data);
            })
            .catch(err => console.error(err));
    }, []);

    if (!Auth.isAuthenticated()) return null;

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
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
