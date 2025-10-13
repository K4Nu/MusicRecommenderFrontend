import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router";
import App from './App.jsx'
import Login from "./components/Login.jsx";

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    }

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
