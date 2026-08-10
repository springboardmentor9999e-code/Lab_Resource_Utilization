import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    FaTachometerAlt,
    FaFlask,
    FaClipboardList,
    FaChartLine,
    FaProjectDiagram,
    FaTools,
    FaCertificate,
    FaFileAlt,
    FaChartPie,
    FaBell,
    FaCog,
    FaSignOutAlt,
    FaUniversity,
    FaChevronDown,
    FaDollarSign
} from "react-icons/fa";

import "../styles/Sidebar.css";

function Sidebar({ mobileMenu }) {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState(null);
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <aside className={mobileMenu ? "sidebar active" : "sidebar"}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <FaUniversity />
                </div>
                <div className="logo-text">
                    <h2>Lab Resource</h2>
                    <p>AI Utilization Platform</p>
                </div>
            </div>

            {/* User */}
            <div className="sidebar-user">
                <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                    <h4>{user.name || "User"}</h4>
                    <span>{user.role || "Researcher"}</span>
                </div>
            </div>

            <div className="menu-title">MAIN MENU</div>

            <nav className="sidebar-menu">
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                </NavLink>

                {/* Equipment */}
                <div className="menu-group">
                    <div className="menu-item dropdown-title" onClick={() => toggleMenu("equipment")}>
                        <FaFlask />
                        <span>Equipment</span>
                        <FaChevronDown className={openMenu === "equipment" ? "arrow rotate" : "arrow"} />
                    </div>
                    {openMenu === "equipment" && (
                        <div className="submenu">
                            <NavLink to="/browse-equipment" className="sub-item">Browse Equipment</NavLink>
                            <NavLink to="/equipment-list" className="sub-item">Equipment List</NavLink>
                        </div>
                    )}
                </div>

                {/* Booking */}
                <NavLink to="/booking" className={({ isActive }) => (isActive ? "menu-item active" : "menu-item")}>
                    <FaClipboardList />
                    <span>Bookings</span>
                </NavLink>

                <NavLink to="/utilization" className="menu-item">
                    <FaChartLine />
                    <span>Utilization</span>
                </NavLink>

                <NavLink to="/heatmap" className="menu-item">
                    <FaChartPie />
                    <span>Heat Map</span>
                </NavLink>

                {/* Sharing */}
                <div className="menu-group">
                    <div className="menu-item dropdown-title" onClick={() => toggleMenu("sharing")}>
                        <FaProjectDiagram />
                        <span>Resource Sharing</span>
                        <FaChevronDown className={openMenu === "sharing" ? "arrow rotate" : "arrow"} />
                    </div>
                    {openMenu === "sharing" && (
                        <div className="submenu">
                            <NavLink to="/request-access" className="sub-item">Request Access</NavLink>
                            <NavLink to="/my-requests" className="sub-item">My Requests</NavLink>
                            <NavLink to="/pending-requests" className="sub-item">Pending Requests</NavLink>
                        </div>
                    )}
                </div>

                <NavLink to="/maintenance" className="menu-item">
                    <FaTools />
                    <span>Maintenance</span>
                </NavLink>

                <NavLink to="/calibration" className="menu-item">
                    <FaCertificate />
                    <span>Calibration</span>
                </NavLink>

                <NavLink to="/billing" className="menu-item">
                    <FaDollarSign />
                    <span>Billing & Costs</span>
                </NavLink>

                <NavLink to="/reports" className="menu-item">
                    <FaFileAlt />
                    <span>Reports</span>
                </NavLink>

                <NavLink to="/analytics" className="menu-item">
                    <FaChartPie />
                    <span>Analytics</span>
                </NavLink>

                <NavLink to="/notifications" className="menu-item">
                    <FaBell />
                    <span>Notifications</span>
                </NavLink>

                <NavLink to="/settings" className="menu-item">
                    <FaCog />
                    <span>Settings</span>
                </NavLink>
            </nav>

            <button className="logout-button" onClick={logout}>
                <FaSignOutAlt />
                <span>Logout</span>
            </button>
        </aside>
    );
}

export default Sidebar;