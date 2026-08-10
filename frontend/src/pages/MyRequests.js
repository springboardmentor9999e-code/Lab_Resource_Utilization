import React, { useEffect, useState } from "react";
import { getAllRequests } from "../services/sharingService";
import { FaClock, FaList } from "react-icons/fa";
import "../styles/dashboard.css";

function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const response = await getAllRequests();
            setRequests(response.data);
        } catch (error) {
            console.error("Error loading my requests:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>My Resource Sharing Requests</h1>
                <p>Track outgoing inter-institution resource sharing and access request statuses</p>
            </div>

            <div className="chart-card">
                <h3><FaList style={{ marginRight: "10px", color: "#2563eb" }} /> Submitted Access Requests</h3>

                {loading ? (
                    <p>Loading requests...</p>
                ) : requests.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <FaClock style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.4 }} />
                        <p>No sharing requests submitted yet.</p>
                    </div>
                ) : (
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>Request #</th>
                                <th>Equipment ID</th>
                                <th>Booking Date</th>
                                <th>Time Slot</th>
                                <th>Purpose</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(request => (
                                <tr key={request.requestId}>
                                    <td><strong>REQ-{100 + request.requestId}</strong></td>
                                    <td>Equipment #{request.equipmentId}</td>
                                    <td>{request.bookingDate}</td>
                                    <td>{request.startTime} - {request.endTime}</td>
                                    <td>{request.purpose}</td>
                                    <td>
                                        <span style={{
                                            padding: "4px 12px",
                                            borderRadius: "12px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            background: request.status === "APPROVED" ? "#d1fae5" : request.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                                            color: request.status === "APPROVED" ? "#065f46" : request.status === "REJECTED" ? "#991b1b" : "#92400e"
                                        }}>
                                            {request.status || "PENDING"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default MyRequests;