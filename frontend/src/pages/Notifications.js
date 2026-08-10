import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaBell,
    FaCheck,
    FaTrash,
    FaExclamationCircle,
    FaTools,
    FaCalendarCheck,
    FaInfoCircle
} from "react-icons/fa";
import "../styles/dashboard.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("ALL");

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notif) => {
        try {
            await axios.put(`http://localhost:8080/api/notifications/${notif.notificationId}`, {
                ...notif,
                status: "READ"
            });
            fetchNotifications();
        } catch (err) {
            console.error("Error updating notification:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error("Error deleting notification:", err);
        }
    };

    const filtered = notifications.filter((n) => {
        if (filterType === "ALL") return true;
        return n.type === filterType;
    });

    const unreadCount = notifications.filter(n => n.status === "UNREAD").length;

    const getIcon = (type) => {
        switch (type) {
            case "MAINTENANCE":
                return <FaTools style={{ color: "#f59e0b" }} />;
            case "CALIBRATION":
                return <FaExclamationCircle style={{ color: "#ef4444" }} />;
            case "BOOKING":
                return <FaCalendarCheck style={{ color: "#3b82f6" }} />;
            default:
                return <FaInfoCircle style={{ color: "#10b981" }} />;
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1>Notification & Alert Center</h1>
                    <p>System alerts, maintenance schedules, calibration reminders, and booking notifications</p>
                </div>
                <div style={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    padding: "10px 20px",
                    borderRadius: "15px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <FaBell /> {unreadCount} Unread Alerts
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
                {["ALL", "CALIBRATION", "MAINTENANCE", "BOOKING", "ALERT"].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "20px",
                            border: "1px solid #cbd5e1",
                            background: filterType === type ? "#2563eb" : "#f8fafc",
                            color: filterType === type ? "white" : "#475569",
                            cursor: "pointer",
                            fontWeight: "600"
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="chart-card">
                <h3><FaBell style={{ marginRight: "10px", color: "#2563eb" }} /> Notifications List</h3>

                {loading ? (
                    <p>Loading alerts...</p>
                ) : filtered.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <FaBell style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.4 }} />
                        <p>No notifications found in this category.</p>
                    </div>
                ) : (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {filtered.map((item) => (
                            <li
                                key={item.notificationId}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "18px",
                                    marginBottom: "12px",
                                    borderRadius: "16px",
                                    background: item.status === "UNREAD" ? "#eff6ff" : "#f8fafc",
                                    borderLeft: `5px solid ${item.status === "UNREAD" ? "#2563eb" : "#cbd5e1"}`,
                                    transition: "0.2s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                    <div style={{ fontSize: "22px" }}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "16px" }}>{item.title}</h4>
                                        <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>{item.message}</p>
                                        <small style={{ color: "#94a3b8" }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Just now"}</small>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    {item.status === "UNREAD" && (
                                        <button
                                            onClick={() => handleMarkAsRead(item)}
                                            title="Mark as read"
                                            style={{
                                                background: "#10b981",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 12px",
                                                borderRadius: "8px",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <FaCheck /> Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(item.notificationId)}
                                        title="Delete"
                                        style={{
                                            background: "#ef4444",
                                            color: "white",
                                            border: "none",
                                            padding: "8px 12px",
                                            borderRadius: "8px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Notifications;