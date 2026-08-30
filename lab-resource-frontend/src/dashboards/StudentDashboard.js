import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";
import NotificationBell from "../components/NotificationBell";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function StudentDashboard() {

    // ===========================
    // Navigation
    // ===========================

    const [activePage, setActivePage] = useState("dashboard");

    // ===========================
    // Dashboard
    // ===========================

    const [dashboard, setDashboard] = useState({
        totalEquipment: 0,
        totalAvailableEquipment: 0,
        totalBookings: 0
    });

    // ===========================
    // Equipment
    // ===========================

    const [equipmentList, setEquipmentList] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);

    const [searchName, setSearchName] = useState("");
    const [searchCode, setSearchCode] = useState("");

    // ===========================
    // Booking
    // ===========================

    const [bookingList, setBookingList] = useState([]);

    const [bookedBy, setBookedBy] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [bookingStatus, setBookingStatus] = useState("Pending");

    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");

    // ===========================
    // User Profile
    // ===========================

    const [userProfile, setUserProfile] = useState({
        username: "",
        email: "",
        role: ""
    });

    // ===========================
    // Dashboard API
    // ===========================

    const fetchDashboard = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/dashboard"
            );

            const totalAvailable = equipmentList.filter(
                equipment => equipment.status === "Available"
            ).length;

            setDashboard({
                totalEquipment: response.data.totalEquipment,
                totalBookings: response.data.totalBookings,
                totalAvailableEquipment: totalAvailable
            });

        } catch (error) {

            console.error(error);

        }

    };

    // ===========================
    // Equipment API
    // ===========================

    const fetchEquipment = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/equipment"
            );

            setEquipmentList(response.data);
            setFilteredEquipment(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    // ===========================
    // Booking API
    // ===========================

    const fetchBookings = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/bookings"
            );

            setBookingList(response.data);

        } catch (error) {

            console.error(error);

        }

    };

    // ===========================
    // Profile API
    // ===========================

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/users/profile");
            setUserProfile(response.data);
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    // ===========================
    // Load Data
    // ===========================

    useEffect(() => {

        fetchEquipment();
        fetchBookings();
        fetchUserProfile();

    }, []);

    useEffect(() => {

        fetchDashboard();

    }, [equipmentList]);

    // ===========================
    // Search Equipment
    // ===========================

    const searchEquipment = () => {

        const filtered = equipmentList.filter((equipment) => {

            const matchName =
                equipment.equipmentName
                    .toLowerCase()
                    .includes(searchName.toLowerCase());

            const matchCode =
                equipment.equipmentCode
                    .toLowerCase()
                    .includes(searchCode.toLowerCase());

            return matchName && matchCode;

        });

        setFilteredEquipment(filtered);

    };

    // ===========================
    // Reset Search
    // ===========================

    const resetSearch = () => {

        setSearchName("");
        setSearchCode("");
        setFilteredEquipment(equipmentList);

    };

    // ===========================
    // Book Equipment
    // ===========================

    const saveBooking = async () => {

        if (
            bookedBy.trim() === "" ||
            bookingDate === "" ||
            startTime === "" ||
            endTime === "" ||
            purpose.trim() === "" ||
            selectedEquipmentId === ""
        ) {

            alert("Please fill all required fields.");
            return;

        }

        try {

            const booking = {

                bookedBy,
                bookingDate,
                startTime,
                endTime,
                purpose,
                status: bookingStatus,

                equipment: {
                    id: selectedEquipmentId
                }

            };

            await axios.post(
                "http://localhost:8080/api/bookings",
                booking
            );

            alert("Equipment Booked Successfully");

            setBookedBy("");
            setBookingDate("");
            setStartTime("");
            setEndTime("");
            setPurpose("");
            setBookingStatus("Pending");
            setSelectedEquipmentId("");

            fetchBookings();

        } catch (error) {

            console.error(error);
            alert("Booking Failed");

        }

    };

    // ===========================
    // Clear Booking Form
    // ===========================

    const clearBookingForm = () => {

        setBookedBy("");
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        setPurpose("");
        setBookingStatus("Pending");
        setSelectedEquipmentId("");

    };

    // ===========================
    // Cancel Booking
    // ===========================

    const cancelBooking = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:8080/api/bookings/${id}`);
            alert("Booking Cancelled Successfully");
            fetchBookings();
            fetchDashboard();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking");
        }
    };

    // ===========================
    // Styling
    // ===========================

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
        secondaryButton: {
            padding: "10px 20px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#475569",
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
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "equipment", label: "Available Equipment" },
        { id: "bookings", label: "My Bookings" },
        { id: "profile", label: "Profile" }
    ];

    // Card stats calculations
    const pendingRequestsCount = bookingList.filter(b => b.status === "Pending").length;
    const approvedBookingsCount = bookingList.filter(b => b.status === "Approved").length;
    const activeBookingsCount = bookingList.filter(b => b.status === "Approved" || b.status === "Pending").length;

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div>
                        <h2 style={styles.sidebarTitle}>Student</h2>
                        <p style={styles.sidebarSubtitle}>Lab Resource Portal</p>
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}
                            >
                                <div>
                                    <h1 style={styles.pageTitle}>Dashboard Overview</h1>
                                    <p style={styles.pageSubtitle}>Welcome to your student lab resource overview</p>
                                </div>
                                <NotificationBell />
                            </div>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#3b82f6")}>
                                <span style={styles.statTitle}>Available Equipment</span>
                                <span style={styles.statValue}>
                                    {dashboard.totalAvailableEquipment || dashboard.totalEquipment}
                                </span>
                            </div>

                            <div style={styles.statCard("#10b981")}>
                                <span style={styles.statTitle}>My Active Bookings</span>
                                <span style={styles.statValue}>{activeBookingsCount}</span>
                            </div>

                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Pending Requests</span>
                                <span style={styles.statValue}>{pendingRequestsCount}</span>
                            </div>

                            <div style={styles.statCard("#8b5cf6")}>
                                <span style={styles.statTitle}>Approved Bookings</span>
                                <span style={styles.statValue}>{approvedBookingsCount}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* AVAILABLE EQUIPMENT PAGE */}
                {activePage === "equipment" && (
                    <div>
                        <div style={styles.headerArea}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}
                            >
                                <div>
                                    <h1 style={styles.pageTitle}>Available Equipment</h1>
                                    <p style={styles.pageSubtitle}>Explore equipment and submit laboratory reservation requests</p>
                                </div>
                                <NotificationBell />
                            </div>
                        </div>

                        {/* Search Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Search Equipment</h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "700px", flexWrap: "wrap", alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Search by Equipment Name"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    style={{ ...styles.input, flex: "1 1 200px" }}
                                />

                                <input
                                    type="text"
                                    placeholder="Search by Equipment Code"
                                    value={searchCode}
                                    onChange={(e) => setSearchCode(e.target.value)}
                                    style={{ ...styles.input, flex: "1 1 200px" }}
                                />

                                <button onClick={searchEquipment} style={styles.primaryButton}>
                                    Search
                                </button>

                                <button onClick={resetSearch} style={styles.secondaryButton}>
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* Book Equipment Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Book Equipment</h3>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Booked By</label>
                                    <input
                                        type="text"
                                        placeholder="Booked By"
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
                                        {equipmentList.map((equipment) => (
                                            <option key={equipment.id} value={equipment.id}>
                                                {equipment.equipmentName}
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
                                        placeholder="Purpose"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button onClick={saveBooking} style={styles.primaryButton}>
                                    Book Equipment
                                </button>
                                <button onClick={clearBookingForm} style={styles.secondaryButton}>
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Equipment Table */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Equipment Inventory</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Code</th>
                                        <th style={styles.th}>Manufacturer</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Availability</th>
                                        <th style={styles.th}>Location</th>
                                        <th style={styles.th}>Laboratory</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredEquipment.length > 0 ? (
                                        filteredEquipment.map((equipment) => (
                                            <tr key={equipment.id}>
                                                <td style={styles.td}>{equipment.id}</td>
                                                <td style={styles.td}>{equipment.equipmentName}</td>
                                                <td style={styles.td}>{equipment.equipmentCode}</td>
                                                <td style={styles.td}>{equipment.manufacturer}</td>
                                                <td style={styles.td}>{equipment.status}</td>
                                                <td style={styles.td}>{equipment.availability}</td>
                                                <td style={styles.td}>{equipment.location}</td>
                                                <td style={styles.td}>
                                                    {equipment.laboratory
                                                        ? equipment.laboratory.laboratoryName
                                                        : ""}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" style={{ ...styles.td, textAlign: "center" }}>
                                                No Equipment Found
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MY BOOKINGS PAGE */}
                {activePage === "bookings" && (
                    <div>
                        <div style={styles.headerArea}>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}
                            >
                                <div>
                                    <h1 style={styles.pageTitle}>My Bookings</h1>
                                    <p style={styles.pageSubtitle}>Track and manage your equipment reservations</p>
                                </div>
                                <NotificationBell />
                            </div>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Booking History & Status</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Equipment</th>
                                        <th style={styles.th}>Equipment Cost</th>
                                        <th style={styles.th}>Booked By</th>
                                        <th style={styles.th}>Booking Date</th>
                                        <th style={styles.th}>Start Time</th>
                                        <th style={styles.th}>End Time</th>
                                        <th style={styles.th}>Purpose</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bookingList.length > 0 ? (
                                        bookingList.map((booking) => (
                                            <tr key={booking.id}>
                                                <td style={styles.td}>{booking.id}</td>
                                                <td style={styles.td}>
                                                    {booking.equipment
                                                        ? booking.equipment.equipmentName
                                                        : ""}
                                                </td>
                                                <td style={styles.td}>
                                                    ₹{booking.equipment?.equipmentCost}
                                                </td>
                                                <td style={styles.td}>{booking.bookedBy}</td>
                                                <td style={styles.td}>{booking.bookingDate}</td>
                                                <td style={styles.td}>{booking.startTime}</td>
                                                <td style={styles.td}>{booking.endTime}</td>
                                                <td style={styles.td}>{booking.purpose}</td>
                                                <td style={styles.td}>
                                                        <span style={styles.badge(booking.status)}>
                                                            {booking.status}
                                                        </span>
                                                </td>
                                                <td style={{ ...styles.td, textAlign: "right" }}>
                                                    {booking.status === "Pending" ? (
                                                        <button
                                                            onClick={() => cancelBooking(booking.id)}
                                                            style={styles.actionButtonDelete}
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" style={{ ...styles.td, textAlign: "center" }}>
                                                No Booking Records Found
                                            </td>
                                        </tr>
                                    )}
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
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "20px"
                                }}
                            >
                                <div>
                                    <h1 style={styles.pageTitle}>Profile</h1>
                                    <p style={styles.pageSubtitle}>View your student profile details</p>
                                </div>
                                <NotificationBell />
                            </div>
                        </div>

                        <div style={{ ...styles.card, maxWidth: "500px" }}>
                            <h3 style={styles.cardTitle}>Student Information</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Username</label>
                                    <input
                                        type="text"
                                        value={userProfile.username || "Student"}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input
                                        type="email"
                                        value={userProfile.email || "student@lab.org"}
                                        disabled
                                        style={{ ...styles.input, backgroundColor: "#f1f5f9" }}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Role</label>
                                    <input
                                        type="text"
                                        value={userProfile.role || "Student"}
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

export default StudentDashboard;