import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router";
import App from './App.jsx'

const router = createBrowserRouter([
    {
        path: '/login',
    },
    {
        path: '/register',
    },
    {
        path: '/spotify/check',
    }

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
