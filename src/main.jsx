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


const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/", element: <Index /> },
    {path:"/spotify/callback", element:<SpotifyApiComponent /> },
    {path:"/youtube/callback", element:<YoutubeApiComponent />},
    {path:"/register",element:<Register />},
]);

createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <RouterProvider router={router} />
        </AuthProvider>
);
