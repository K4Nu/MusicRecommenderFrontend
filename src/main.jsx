import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider,Navigate  } from "react-router-dom"; // <= tu 'react-router-dom'
import Login from "./pages/Login.jsx";
import Index from "./pages/Index.jsx";
import SpotifyApiComponent from "./components/Spotify/SpotifyApiComponent.jsx";
import YoutubeApiComponent from "./components/Youtube/YoutubeAPIComponent.jsx";
import Register from "./pages/Register.jsx";
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "./components/auth/PublicOnlyRoute.jsx";


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
