// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // <= tu 'react-router-dom'
import Login from "./components/Login.jsx";
import Index from "./components/Index.jsx";
import SpotifyApiComponent from "./components/SpotifyApiComponent.jsx";
import YoutubeApiComponent from "./components/YoutubeApiComponent";

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/", element: <Index /> },
    {path:"/spotify/callback", element:<SpotifyApiComponent /> },
    {path:"/youtube/callback", element:<YoutubeApiComponent />},
]);

createRoot(document.getElementById("root")).render(
        <RouterProvider router={router} />
);
