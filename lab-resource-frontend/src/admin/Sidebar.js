import React from "react";

function Sidebar({
                     activePage,
                     setActivePage,
                     styles
                 }) {

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "institutions", label: "Institutions" },
        { id: "departments", label: "Departments" },
        { id: "laboratories", label: "Laboratories" },
        { id: "equipment", label: "Equipment" },
        { id: "bookings", label: "Bookings" }
    ];

    return (
        <div style={styles.sidebar}>

            <div style={styles.sidebarHeader}>
                <div>
                    <h2 style={styles.sidebarTitle}>Lab Resource</h2>
                    <p style={styles.sidebarSubtitle}>
                        Management System
                    </p>
                </div>
            </div>

            <div style={styles.navList}>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        style={styles.navButton(activePage === item.id)}
                        onClick={() => setActivePage(item.id)}
                        onMouseEnter={(e) => {
                            if (activePage !== item.id) {
                                e.currentTarget.style.backgroundColor = "#1e293b";
                                e.currentTarget.style.color = "#ffffff";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activePage !== item.id) {
                                e.currentTarget.style.backgroundColor = "transparent";
                                e.currentTarget.style.color = "#94a3b8";
                            }
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            <button
                style={styles.logoutButton}
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#ef4444";
                }}
            >
                Logout
            </button>

        </div>
    );
}

export default Sidebar;