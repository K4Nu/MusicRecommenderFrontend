import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="navbar bg-base-100 shadow-md px-4 sm:px-6">

            {/* LEFT - LOGO */}
            <div className="navbar-start">
                <button
                    onClick={() => navigate("/")}
                    className="btn btn-ghost text-lg sm:text-xl font-semibold normal-case"
                >
                    Recommender
                </button>
            </div>

            {/* RIGHT - USER MENU */}
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <label
                        tabIndex={0}
                        className="btn btn-ghost btn-circle"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">

                            {/* User Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.8}
                                stroke="currentColor"
                                className="w-5 h-5 sm:w-6 sm:h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                                />
                            </svg>

                        </div>
                    </label>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44 sm:w-52"
                    >
                        <li>
                            <button onClick={() => navigate("/profile")}>
                                Profile
                            </button>
                        </li>

                        <li>
                            <button onClick={() => navigate("/settings")}>
                                Settings
                            </button>
                        </li>

                        <li>
                            <button
                                onClick={handleLogout}
                                className="text-error"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
