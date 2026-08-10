import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClock, FaUsers, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import "../styles/dashboard.css";

function DepartmentWaitingList() {
    const [waitingList, setWaitingList] = useState([]);
    const [loading, setLoading] = useState(true);

    const role = localStorage.getItem("role");

    useEffect(() => {
        loadWaitingList();
    }, []);

    const loadWaitingList = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/waiting-list/all");
            setWaitingList(res.data || []);
        } catch (error) {
            console.error("Error loading waitlist entries:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/waiting-list/promote/${id}`);
            alert("Waitlist entry promoted and notified successfully!");
            loadWaitingList();
        } catch (error) {
            console.error("Promotion Error:", error);
            alert("Failed to promote waitlist entry.");
        }
    };

    const isAdmin = role === "SYSTEM_ADMINISTRATOR" || role === "DEPARTMENT_ADMINISTRATOR" || role === "LAB_TECHNICIAN";

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Equipment Waitlist & Optimization Queue</h1>
                <p>Track queue positions for highly utilized equipment and manage automatic booking slot fulfillment</p>
            </div>

            <div className="chart-card">
                <h3><FaUsers style={{ marginRight: "10px", color: "#2563eb" }} /> Active Waitlist Queue</h3>

                {loading ? (
                    <p>Loading waitlist...</p>
                ) : waitingList.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <FaClock style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.4 }} />
                        <p>No researchers currently on equipment waitlists.</p>
                    </div>
                ) : (
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>Waitlist #</th>
                                <th>User ID</th>
                                <th>Equipment ID</th>
                                <th>Request Time</th>
                                <th>Status</th>
                                {isAdmin && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {waitingList.map(item => (
                                <tr key={item.id}>
                                    <td><strong>#WL-{item.id}</strong></td>
                                    <td>User #{item.userId}</td>
                                    <td>Equipment #{item.equipmentId}</td>
                                    <td>{item.requestTime ? new Date(item.requestTime).toLocaleString() : 'Recent'}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            background: item.status === "NOTIFIED" || item.status === "FULFILLED" ? "#d1fae5" : "#fef3c7",
                                            color: item.status === "NOTIFIED" || item.status === "FULFILLED" ? "#065f46" : "#92400e"
                                        }}>
                                            {item.status || "WAITING"}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {item.status === "WAITING" ? (
                                                <button
                                                    onClick={() => handlePromote(item.id)}
                                                    style={{
                                                        background: "#10b981",
                                                        color: "white",
                                                        border: "none",
                                                        padding: "5px 12px",
                                                        borderRadius: "8px",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px"
                                                    }}
                                                >
                                                    <FaCheck /> Promote Slot
                                                </button>
                                            ) : (
                                                <span style={{ color: "#94a3b8", fontSize: "12px" }}>Notified</span>
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

export default DepartmentWaitingList;