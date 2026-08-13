import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaSearch,
    FaBell,
    FaMoon,
    FaSun,
    FaUserCircle,
    FaChevronDown
} from "react-icons/fa";

import "../styles/Navbar.css";

function Navbar() {

    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchText, setSearchText] = useState("");

    const user =
        JSON.parse(localStorage.getItem("user")) || {};

    // ==========================================
    // DARK MODE
    // ==========================================

    const toggleTheme = () => {

        setDarkMode((previousMode) => !previousMode);

        document.body.classList.toggle("dark-mode");
    };

    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearchChange = (event) => {

        setSearchText(event.target.value);
    };

    const handleSearch = (event) => {

        if (event.key !== "Enter") {
            return;
        }

        const query = searchText.trim().toLowerCase();

        if (!query) {
            return;
        }

        // Equipment search
        if (
            query.includes("equipment") ||
            query.includes("equip") ||
            query.includes("resource") ||
            query.includes("laptop") ||
            query.includes("microscope") ||
            query.includes("computer")
        ) {
            navigate("/equipment");
            return;
        }

        // Booking search
        if (
            query.includes("booking") ||
            query.includes("book") ||
            query.includes("reservation")
        ) {
            navigate("/booking");
            return;
        }

        // Maintenance
        if (query.includes("maintenance")) {
            navigate("/maintenance");
            return;
        }

        // Calibration
        if (
            query.includes("calibration") ||
            query.includes("calibrate")
        ) {
            navigate("/calibration");
            return;
        }

        // Utilization
        if (query.includes("utilization")) {
            navigate("/utilization");
            return;
        }

        // Reports
        if (query.includes("report")) {
            navigate("/reports");
            return;
        }

        // Analytics
        if (query.includes("analytics")) {
            navigate("/analytics");
            return;
        }

        // Notifications
        if (query.includes("notification")) {
            navigate("/notifications");
            return;
        }

        // Settings
        if (query.includes("setting")) {
            navigate("/settings");
            return;
        }

        // Default
        alert(
            `No matching page found for "${searchText}"`
        );
    };

    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const goToNotifications = () => {

        navigate("/notifications");
    };

    // ==========================================
    // PROFILE
    // ==========================================

    const goToProfile = () => {

        setShowProfile(false);

        navigate("/profile");
    };

    // ==========================================
    // SETTINGS
    // ==========================================

    const goToSettings = () => {

        setShowProfile(false);

        navigate("/settings");
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    // ==========================================
    // JSX
    // ==========================================

    return (

        <header className="navbar">

            {/* ==================================
                LEFT SIDE
            ================================== */}

            <div className="navbar-left">

                {/* SEARCH */}

                <div className="search-box">

                    <FaSearch className="search-icon" />

                    <input
                        type="text"
                        value={searchText}
                        onChange={handleSearchChange}
                        onKeyDown={handleSearch}
                        placeholder="Search equipment, booking..."
                        aria-label="Search equipment or booking"
                    />

                    {searchText && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => setSearchText("")}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>


            {/* ==================================
                RIGHT SIDE
            ================================== */}

            <div className="navbar-right">

                {/* DARK MODE */}

                <button
                    type="button"
                    className="icon-btn"
                    onClick={toggleTheme}
                    title={
                        darkMode
                            ? "Light mode"
                            : "Dark mode"
                    }
                    aria-label="Toggle theme"
                >

                    {darkMode
                        ? <FaSun />
                        : <FaMoon />
                    }

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


                {/* PROFILE */}

                <div
                    className="profile-section"
                    onClick={() =>
                        setShowProfile(
                            (previous) => !previous
                        )
                    }
                >

                    <FaUserCircle
                        className="profile-icon"
                    />


                    <div className="profile-text">

                        <h4>
                            {user.name || "User"}
                        </h4>

                        <span>
                            {user.role || "Researcher"}
                        </span>

                    </div>


                    <FaChevronDown />


                    {/* PROFILE DROPDOWN */}

                    {showProfile && (

                        <div
                            className="profile-dropdown"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
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