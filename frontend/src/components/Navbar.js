import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaBell,
    FaMoon,
    FaSun,
    FaBars,
    FaUserCircle,
    FaChevronDown
} from "react-icons/fa";

import "../styles/Navbar.css";

function Navbar({ toggleSidebar }) {
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const user = JSON.parse(localStorage.getItem("user")) || {};

    const toggleTheme = () => {
        setDarkMode((previousMode) => !previousMode);
        document.body.classList.toggle("dark-mode");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const goToNotifications = () => {
        navigate("/notifications");
    };

    const goToProfile = () => {
        setShowProfile(false);
        navigate("/profile");
    };

    const goToSettings = () => {
        setShowProfile(false);
        navigate("/settings");
    };

    return (
        <header className="navbar">

            {/* LEFT SIDE */}
            <div className="navbar-left">

                <button
                    type="button"
                    className="menu-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <FaBars />
                </button>

                {/* ONE SEARCH BAR ONLY */}
                <div className="search-box">
                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        placeholder="Search equipment, booking..."
                        aria-label="Search equipment or booking"
                    />
                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="navbar-right">

                {/* THEME */}
                <button
                    type="button"
                    className="icon-btn"
                    onClick={toggleTheme}
                    title={darkMode ? "Light mode" : "Dark mode"}
                    aria-label="Toggle theme"
                >
                    {darkMode ? <FaSun /> : <FaMoon />}
                </button>


                {/* NOTIFICATIONS */}
                <button
                    type="button"
                    className="icon-btn notification-btn"
                    onClick={goToNotifications}
                    title="View Notifications"
                    aria-label="View notifications"
                >
                    <FaBell />

                    <span className="notification-count">
                        !
                    </span>
                </button>


                {/* ACCOUNT */}
                <div
                    className="profile-section"
                    onClick={() => setShowProfile((previous) => !previous)}
                >

                    <FaUserCircle className="profile-icon" />

                    <div className="profile-text">
                        <h4>
                            {user.name || "User"}
                        </h4>

                        <span>
                            {user.role || "Researcher"}
                        </span>
                    </div>

                    <FaChevronDown />


                    {/* ACCOUNT DROPDOWN */}
                    {showProfile && (
                        <div
                            className="profile-dropdown"
                            onClick={(event) => event.stopPropagation()}
                        >

                            <button
                                type="button"
                                onClick={goToProfile}
                            >
                                My Profile
                            </button>

                            <button
                                type="button"
                                onClick={goToSettings}
                            >
                                Settings
                            </button>

                            <button
                                type="button"
                                onClick={logout}
                            >
                                Logout
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
}

export default Navbar;