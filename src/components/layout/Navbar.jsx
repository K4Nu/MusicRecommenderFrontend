import React from "react";

const Navbar = () => {
    return (
        <div className="navbar bg-base-100 shadow-md px-4">
            {/* Lewa strona */}
            <div className="navbar-start">
                <span className="btn btn-ghost text-xl">Home</span>
            </div>

            {/* Środek */}
            <div className="navbar-center">
                <label className="input input-bordered flex items-center gap-2 w-64">
                    {/* Ikona lupy (lewa) */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
                        />
                    </svg>

                    <input
                        type="text"
                        className="grow"
                        placeholder="Szukaj..."
                    />

                    {/* Ikona osoby (prawa) */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 opacity-70"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5.121 17.804A8 8 0 1119 10a8 8 0 01-13.879 7.804z"
                        />
                    </svg>
                </label>
            </div>

            <div className="navbar-end" />
        </div>
    );
};

export default Navbar;
