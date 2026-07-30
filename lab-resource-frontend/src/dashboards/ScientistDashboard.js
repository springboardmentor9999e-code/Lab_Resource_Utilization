import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function ScientistDashboard() {

    // Navigation
    const [activePage, setActivePage] = useState("dashboard");

    // Dashboard
    const [dashboard, setDashboard] = useState({
        totalEquipment: 0,
        myBookings: 0,
        approvedBookings: 0,
        totalReports: 0
    });

    // Equipment
    const [equipmentList, setEquipmentList] = useState([]);

    // Bookings
    const [bookingList, setBookingList] = useState([]);
    const [bookedBy, setBookedBy] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");

    // Profile
    const [userProfile, setUserProfile] = useState({
        username: "",
        email: "",
        role: ""
    });

    useEffect(() => {
        fetchDashboard();
        fetchEquipment();
        fetchBookings();
        fetchUserProfile();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/dashboard");
            setDashboard(res.data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/equipment");
            setEquipmentList(res.data);
        } catch (error) {
            console.error("Error fetching equipment:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/bookings");
            setBookingList(res.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/users/profile");
            setUserProfile(res.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const saveBooking = async () => {
        if (!selectedEquipmentId || !bookingDate || !startTime || !endTime) {
            alert("Please fill required fields.");
            return;
        }

        try {
            const booking = {
                bookedBy,
                bookingDate,
                startTime,
                endTime,
                purpose,
                status: "Pending",
                equipment: {
                    id: selectedEquipmentId
                }
            };

            await axios.post("http://localhost:8080/api/bookings", booking);

            alert("Research Booking Request Submitted!");

            setBookedBy("");
            setBookingDate("");
            setStartTime("");
            setEndTime("");
            setPurpose("");
            setSelectedEquipmentId("");

            fetchBookings();
            fetchDashboard();

        } catch (error) {
            console.error("Error creating booking:", error);
            alert("Failed to submit booking");
        }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/bookings/${id}`);
            alert("Booking Cancelled Successfully!");
            fetchBookings();
            fetchDashboard();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking");
        }
    };

    const styles = {
        container: {
            display: "flex",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#334155"
        },
        sidebar: {
            width: "260px",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.05)"
        },
        sidebarHeader: {
            padding: "24px 20px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        sidebarTitle: {
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            color: "#ffffff",
            margin: 0
        },
        sidebarSubtitle: {
            fontSize: "11px",
            color: "#94a3b8",
            margin: "2px 0 0 0",
            textTransform: "uppercase",
            letterSpacing: "1px"
        },
        navList: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "20px 12px",
            flex: 1
        },
        navButton: (isActive) => ({
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isActive ? "#2563eb" : "transparent",
            color: isActive ? "#ffffff" : "#94a3b8",
            fontSize: "14px",
            fontWeight: isActive ? "600" : "500",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            outline: "none"
        }),
        logoutButton: {
            margin: "auto 12px 20px 12px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #334155",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
        },
        mainContent: {
            marginLeft: "260px",
            flex: 1,
            padding: "32px",
            maxWidth: "calc(100vw - 260px)",
            boxSizing: "border-box"
        },
        headerArea: {
            marginBottom: "28px"
        },
        pageTitle: {
            fontSize: "26px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 6px 0"
        },
        pageSubtitle: {
            fontSize: "14px",
            color: "#64748b",
            margin: 0
        },
        card: {
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
            border: "1px solid #e2e8f0",
            marginBottom: "24px"
        },
        cardTitle: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
        },
        label: {
            fontSize: "13px",
            fontWeight: "500",
            color: "#475569"
        },
        input: {
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s ease",
            backgroundColor: "#ffffff",
            color: "#1e293b"
        },
        select: {
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            cursor: "pointer"
        },
        primaryButton: {
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            alignSelf: "flex-start"
        },
        tableContainer: {
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px"
        },
        th: {
            backgroundColor: "#f1f5f9",
            padding: "12px 16px",
            fontWeight: "600",
            color: "#475569",
            borderBottom: "1px solid #e2e8f0"
        },
        td: {
            padding: "14px 16px",
            borderBottom: "1px solid #f1f5f9",
            color: "#334155"
        },
        actionButtonDelete: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer"
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
        },
        statCard: (borderColor) => ({
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            borderLeft: `4px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column"
        }),
        statTitle: {
            fontSize: "13px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px"
        },
        statValue: {
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a"
        },
        badge: (status) => {
            let bg = "#f1f5f9";
            let color = "#475569";
            if (status === "Approved") {
                bg = "#d1fae5";
                color = "#065f46";
            } else if (status === "Pending") {
                bg = "#fef3c7";
                color = "#92400e";
            } else if (status === "Rejected") {
                bg = "#fee2e2";
                color = "#991b1b";
            }
            return {
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600",
                display: "inline-block",
                backgroundColor: bg,
                color: color
            };
        },
        equipmentGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px"
        },
        equipmentCard: {
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "equipment", label: "Research Equipment" },
        { id: "bookings", label: "Research Bookings" },
        { id: "reports", label: "Reports" },
        { id: "profile", label: "Profile" }
    ];

    // Calculate report values dynamically
    const approvedCount = bookingList.filter((b) => b.status === "Approved").length;
    const pendingCount = bookingList.filter((b) => b.status === "Pending").length;
    const rejectedCount = bookingList.filter((b) => b.status === "Rejected").length;

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div>
                        <h2 style={styles.sidebarTitle}>Scientist</h2>
                        <p style={styles.sidebarSubtitle}>Research Portal</p>
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
                        localStorage.removeItem("role");
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

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* DASHBOARD PAGE */}
                {activePage === "dashboard" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Dashboard Overview</h1>
                            <p style={styles.pageSubtitle}>Welcome to your scientist research dashboard</p>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#3b82f6")}>
                                <span style={styles.statTitle}>Available Equipment</span>
                                <span style={styles.statValue}>
                                    {dashboard.totalEquipment || equipmentList.length}
                                </span>
                            </div>

                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Research Bookings</span>
                                <span style={styles.statValue}>
                                    {dashboard.myBookings || bookingList.length}
                                </span>
                            </div>

                            <div style={styles.statCard("#10b981")}>
                                <span style={styles.statTitle}>Approved Bookings</span>
                                <span style={styles.statValue}>
                                    {dashboard.approvedBookings || approvedCount}
                                </span>
                            </div>

                            <div style={styles.statCard("#8b5cf6")}>
                                <span style={styles.statTitle}>Research Reports</span>
                                <span style={styles.statValue}>
                                    {dashboard.totalReports || (bookingList.length > 0 ? 1 : 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* RESEARCH EQUIPMENT PAGE */}
                {activePage === "equipment" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Research Equipment</h1>
                            <p style={styles.pageSubtitle}>Explore instruments and request laboratory access</p>
                        </div>

                        {/* Request Booking Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Book Equipment</h3>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Booked By</label>
                                    <input
                                        type="text"
                                        placeholder="Scientist Name"
                                        value={bookedBy}
                                        onChange={(e) => setBookedBy(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Select Equipment</label>
                                    <select
                                        value={selectedEquipmentId}
                                        onChange={(e) => setSelectedEquipmentId(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipmentList.map((eq) => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.equipmentName} ({eq.equipmentCode || "No Code"})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Booking Date</label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Purpose</label>
                                    <input
                                        type="text"
                                        placeholder="Research Project Purpose"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <button onClick={saveBooking} style={styles.primaryButton}>
                                Book Equipment
                            </button>
                        </div>

                        {/* Equipment List Grid */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Available Lab Equipment</h3>
                            <div style={styles.equipmentGrid}>
                                {equipmentList.map((eq) => (
                                    <div key={eq.id} style={styles.equipmentCard}>
                                        <div>
                                            <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#0f172a" }}>
                                                {eq.equipmentName}
                                            </h4>
                                            <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#64748b" }}>
                                                <strong>Code:</strong> {eq.equipmentCode || "N/A"}
                                            </p>
                                            <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#64748b" }}>
                                                <strong>Manufacturer:</strong> {eq.manufacturer || "N/A"}
                                            </p>
                                            <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#64748b" }}>
                                                <strong>Model:</strong> {eq.modelNumber || "N/A"}
                                            </p>
                                            <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#64748b" }}>
                                                <strong>Location:</strong> {eq.location || "N/A"}
                                            </p>
                                            <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#64748b" }}>
                                                <strong>Lab:</strong> {eq.laboratory?.laboratoryName || eq.laboratory?.labName || "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={styles.badge(eq.availability === "Available" ? "Approved" : "Pending")}>
                                                {eq.availability || eq.status || "Available"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESEARCH BOOKINGS PAGE */}
                {activePage === "bookings" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Research Bookings</h1>
                            <p style={styles.pageSubtitle}>Monitor and manage your equipment bookings</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>My Booking Records</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Booked By</th>
                                        <th style={styles.th}>Equipment</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Time</th>
                                        <th style={styles.th}>Purpose</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bookingList.map((booking) => (
                                        <tr key={booking.id}>
                                            <td style={styles.td}>{booking.id}</td>
                                            <td style={styles.td}>{booking.bookedBy}</td>
                                            <td style={styles.td}>{booking.equipment?.equipmentName}</td>
                                            <td style={styles.td}>{booking.bookingDate}</td>
                                            <td style={styles.td}>{booking.startTime} - {booking.endTime}</td>
                                            <td style={styles.td}>{booking.purpose}</td>
                                            <td style={styles.td}>
                                                    <span style={styles.badge(booking.status)}>
                                                        {booking.status}
                                                    </span>
                                            </td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                {booking.status === "Pending" ? (
                                                    <button
                                                        onClick={() => deleteBooking(booking.id)}
                                                        style={styles.actionButtonDelete}
                                                    >
                                                        Cancel
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* REPORTS PAGE */}
                {activePage === "reports" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Reports</h1>
                            <p style={styles.pageSubtitle}>Summary and analytics of scientific resource usage</p>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#10b981")}>
                                <span style={styles.statTitle}>Approved Requests</span>
                                <span style={styles.statValue}>{approvedCount}</span>
                            </div>

                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Pending Requests</span>
                                <span style={styles.statValue}>{pendingCount}</span>
                            </div>

                            <div style={styles.statCard("#ef4444")}>
                                <span style={styles.statTitle}>Rejected Requests</span>
                                <span style={styles.statValue}>{rejectedCount}</span>
                            </div>
                        </div>

                        <div style={{ ...styles.card, marginTop: "24px" }}>
                            <h3 style={styles.cardTitle}>Research Usage Summary</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>Metric</th>
                                        <th style={styles.th}>Value</th>
                                        <th style={styles.th}>Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td style={styles.td}>Total Equipment Accessible</td>
                                        <td style={styles.td}>{equipmentList.length}</td>
                                        <td style={styles.td}><span style={styles.badge("Approved")}>Active</span></td>
                                    </tr>
                                    <tr>
                                        <td style={styles.td}>Total Reservations Logged</td>
                                        <td style={styles.td}>{bookingList.length}</td>
                                        <td style={styles.td}><span style={styles.badge("Approved")}>Recorded</span></td>
                                    </tr>
                                    <tr>
                                        <td style={styles.td}>Approval Rate</td>
                                        <td style={styles.td}>
                                            {bookingList.length > 0
                                                ? `${Math.round((approvedCount / bookingList.length) * 100)}%`
                                                : "0%"}
                                        </td>
                                        <td style={styles.td}><span style={styles.badge("Pending")}>Calculated</span></td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* PROFILE PAGE */}
                {activePage === "profile" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Profile</h1>
                            <p style={styles.pageSubtitle}>View and manage scientist account information</p>
                        </div>

                        <div style={{ ...styles.card, maxWidth: "500px" }}>
                            <h3 style={styles.cardTitle}>Scientist Information</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Username</label>
                                    <input
                                        type="text"
                                        value={userProfile.username || "Scientist"}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        value={userProfile.email || "scientist@lab.org"}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Role</label>
                                    <input
                                        type="text"
                                        value={userProfile.role || "Scientist"}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScientistDashboard;