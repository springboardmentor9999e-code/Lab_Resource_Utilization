import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaBookmark, FaCalendarCheck, FaInfoCircle, FaClock } from "react-icons/fa";
import "../styles/booking.css";
import "../styles/dashboard.css";

function Booking() {
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId") || "1";

    const [booking, setBooking] = useState({
        equipmentId: "",
        bookingDate: "",
        startTime: "",
        endTime: ""
    });

    const [selectedEquipmentName, setSelectedEquipmentName] = useState("");

    useEffect(() => {
        loadBookings();
        loadEquipment();
    }, []);

    useEffect(() => {
        if (location.state?.equipmentId) {
            const eqId = String(location.state.equipmentId);
            setBooking(prev => ({
                ...prev,
                equipmentId: eqId
            }));

            if (location.state?.equipmentName) {
                setSelectedEquipmentName(location.state.equipmentName);
            }
        }
    }, [location.state]);

    const loadBookings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/bookings");
            setBookings(res.data || []);
        } catch (error) {
            console.error("Error loading bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEquipment = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/equipment");
            setEquipmentList(res.data || []);

            if (location.state?.equipmentId) {
                const found = (res.data || []).find(e => String(e.id || e.equipmentId) === String(location.state.equipmentId));
                if (found) {
                    setSelectedEquipmentName(found.equipmentName);
                }
            }
        } catch (error) {
            console.error("Error loading equipment:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBooking(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "equipmentId") {
            const found = equipmentList.find(item => String(item.id || item.equipmentId) === String(value));
            setSelectedEquipmentName(found ? found.equipmentName : "");
        }
    };

    const bookEquipment = async (e) => {
        e.preventDefault();
        try {
            if (!userId) {
                alert("User session not found. Please login again.");
                return;
            }

            if (!booking.equipmentId) {
                alert("Please select equipment.");
                return;
            }

            if (!booking.bookingDate) {
                alert("Please select booking date.");
                return;
            }

            if (!booking.startTime || !booking.endTime) {
                alert("Please select start and end time.");
                return;
            }

            const data = {
                equipmentId: Number(booking.equipmentId),
                bookingDate: booking.bookingDate,
                startTime: booking.startTime.length === 5 ? `${booking.startTime}:00` : booking.startTime,
                endTime: booking.endTime.length === 5 ? `${booking.endTime}:00` : booking.endTime,
                userId: Number(userId),
                status: "PENDING"
            };

            await axios.post("http://localhost:8080/api/bookings", data);

            try {
                await axios.post("http://localhost:8080/api/waiting-list/join", null, {
                    params: {
                        userId: Number(userId),
                        equipmentId: Number(booking.equipmentId)
                    }
                });
            } catch (wErr) {
                console.log("Waitlist notice:", wErr);
            }

            alert("Booking Request Submitted Successfully!");

            setBooking({
                equipmentId: "",
                bookingDate: "",
                startTime: "",
                endTime: ""
            });
            setSelectedEquipmentName("");
            loadBookings();

        } catch (error) {
            console.error("Booking Error:", error);
            if (error.response) {
                alert("Booking Failed: " + (error.response.data?.message || JSON.stringify(error.response.data)));
            } else {
                alert(error.message);
            }
        }
    };

    const approveBooking = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/bookings/${id}/approve`);
            alert("Booking Approved!");
            loadBookings();
        } catch (error) {
            console.error("Approve Error:", error);
            alert("Approval Failed");
        }
    };

    const cancelBooking = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/bookings/${id}/cancel`);
            alert("Booking Cancelled!");
            loadBookings();
        } catch (error) {
            console.error("Cancel Error:", error);
            alert("Cancellation Failed");
        }
    };

    const isAdmin = role === "SYSTEM_ADMINISTRATOR" || role === "DEPARTMENT_ADMINISTRATOR" || role === "LAB_TECHNICIAN";

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Equipment Reservation & Booking Schedule</h1>
                <p>Reserve high-precision laboratory resources and track real-time booking status</p>
            </div>

            {/* BOOKING FORM CARD */}
            <div className="chart-card" style={{ maxWidth: "680px", margin: "0 auto 30px auto" }}>
                <h3><FaCalendarCheck style={{ marginRight: "10px", color: "#2563eb" }} /> Equipment Reservation Request</h3>

                {selectedEquipmentName && (
                    <div style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        color: "#1e40af",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}>
                        <FaInfoCircle style={{ color: "#2563eb" }} />
                        Selected Equipment: <strong>{selectedEquipmentName}</strong>
                    </div>
                )}

                <form onSubmit={bookEquipment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Select Equipment</label>
                        <select
                            name="equipmentId"
                            value={booking.equipmentId}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                        >
                            <option value="">-- Choose Equipment --</option>
                            {equipmentList.map((item) => {
                                const id = item.id || item.equipmentId;
                                const isAvail = (item.availableQuantity || 0) > 0;
                                return (
                                    <option key={id} value={id} disabled={!isAvail}>
                                        {item.equipmentName} ({item.category || "Lab"}) {isAvail ? `- ${item.availableQuantity} Available` : "- UNAVAILABLE"}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Booking Date</label>
                            <input
                                type="date"
                                name="bookingDate"
                                value={booking.bookingDate}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                value={booking.startTime}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                value={booking.endTime}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            color: "white",
                            border: "none",
                            padding: "13px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginTop: "10px",
                            boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                        }}
                    >
                        <FaBookmark /> Confirm Equipment Reservation
                    </button>
                </form>
            </div>

            {/* RECENT BOOKINGS TABLE */}
            <div className="chart-card">
                <h3><FaClock style={{ marginRight: "10px", color: "#2563eb" }} /> Equipment Reservation History & Status</h3>
                
                {loading ? (
                    <p>Loading bookings...</p>
                ) : bookings.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#64748b", padding: "30px" }}>No reservation records found.</p>
                ) : (
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User ID</th>
                                <th>Equipment ID</th>
                                <th>Booking Date</th>
                                <th>Time Slot</th>
                                <th>Status</th>
                                {isAdmin && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((item) => (
                                <tr key={item.id}>
                                    <td><strong>#BK-{item.id}</strong></td>
                                    <td>User #{item.userId}</td>
                                    <td>Equipment #{item.equipmentId}</td>
                                    <td>{item.bookingDate}</td>
                                    <td>{item.startTime} - {item.endTime}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            background: item.status === "APPROVED" ? "#d1fae5" : item.status === "CANCELLED" || item.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                                            color: item.status === "APPROVED" ? "#065f46" : item.status === "CANCELLED" || item.status === "REJECTED" ? "#991b1b" : "#92400e"
                                        }}>
                                            {item.status || "PENDING"}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {item.status === "PENDING" ? (
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button
                                                        onClick={() => approveBooking(item.id)}
                                                        style={{ background: "#10b981", color: "white", border: "none", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => cancelBooking(item.id)}
                                                        style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: "#94a3b8", fontSize: "12px" }}>Done</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Booking;