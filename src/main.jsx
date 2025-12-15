import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider,Navigate  } from "react-router-dom"; // <= tu 'react-router-dom'
import Login from "./components/Login.jsx";
import Index from "./components/Index.jsx";
import SpotifyApiComponent from "./components/SpotifyApiComponent.jsx";
import YoutubeApiComponent from "./components/YoutubeApiComponent";
import Register from "./components/Register.jsx";
import { AuthProvider } from './components/AuthContext';
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";


const router = createBrowserRouter([
    // public routes:
    {path: "/login", element: (
        <PublicOnlyRoute>
            <Login />
        </PublicOnlyRoute>
        )},
    {path: "/register", element: (
        <PublicOnlyRoute>
            <Register />
        </PublicOnlyRoute>
        )},
    // secured routes:
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
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <RouterProvider router={router} />
        </AuthProvider>
);
