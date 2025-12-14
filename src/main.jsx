import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // <= tu 'react-router-dom'
import Login from "./components/Login.jsx";
import Index from "./components/Index.jsx";
import SpotifyApiComponent from "./components/SpotifyApiComponent.jsx";
import YoutubeApiComponent from "./components/YoutubeApiComponent";
import Register from "./components/Register.jsx";
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from "./components/ProtectedRoute";


const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },

    // 🔒 trasy chronione:
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <Index />
            </ProtectedRoute>
        ),
    },
    {
        path: "/spotify/callback",
        element: (
            <ProtectedRoute>
                <SpotifyApiComponent />
            </ProtectedRoute>
        ),
    },
    {
        path: "/youtube/callback",
        element: (
            <ProtectedRoute>
                <YoutubeApiComponent />
            </ProtectedRoute>
        ),
    },
]);

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <RouterProvider router={router} />
        </AuthProvider>
);
