// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"; // <= tu 'react-router-dom'
import Login from "./components/Login.jsx";
import Test from "./components/Test.jsx";
import Dziala from "./components/Dziala.jsx";
import SpotifyOutput from "./components/SpotifyOutput.jsx";

const router = createBrowserRouter([
    { path: "/login", element: <Login /> },
    { path: "/", element: <Test /> },
    {path:"/spotify/callback", element:<Dziala /> },
    {path:"/spotify/get",element:<SpotifyOutput />},
]);

createRoot(document.getElementById("root")).render(
        <RouterProvider router={router} />
);
