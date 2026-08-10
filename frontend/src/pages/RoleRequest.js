import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/roleRequest.css";
import "../styles/dashboard.css";

function RoleRequest() {
    const [requests, setRequests] = useState([]);
    const [request, setRequest] = useState({
        requestedRole: "",
        reason: ""
    });

    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/role/request");
            setRequests(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setRequest({
            ...request,
            [e.target.name]: e.target.value
        });
    };

    const submitRequest = async () => {
        const data = {
            userId: userId,
            requestedRole: request.requestedRole,
            reason: request.reason,
            status: "PENDING"
        };

        await axios.post("http://localhost:8080/api/role/request", data);
        alert("Role Request Submitted Successfully!");
        loadRequests();
    };

    const approveRequest = async (id) => {
        await axios.put(`http://localhost:8080/api/role/request/${id}/approve`);
        loadRequests();
    };

    const rejectRequest = async (id) => {
        await axios.put(`http://localhost:8080/api/role/request/${id}/reject`);
        loadRequests();
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Role Request & Privilege Escalation</h1>
                <p>Request lab technician or faculty permissions, review pending role change requests</p>
            </div>

            {(role === "STUDENT" || role === "RESEARCHER") && (
                <div className="chart-card" style={{ maxWidth: "600px", margin: "0 auto 30px auto" }}>
                    <h3>Submit Role Escalation Request</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Requested Role</label>
                            <select name="requestedRole" onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <option value="">Select Role</option>
                                <option value="LAB_TECHNICIAN">Lab Technician</option>
                                <option value="FACULTY">Faculty</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Justification / Reason</label>
                            <textarea name="reason" placeholder="Explain your requirement for requested role privileges..." onChange={handleChange} rows="3" style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <button onClick={submitRequest} style={{ background: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                            Submit Role Request
                        </button>
                    </div>
                </div>
            )}

            <div className="chart-card">
                <h3>Role Change Log</h3>
                <table className="recent-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Requested Role</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(item => (
                            <tr key={item.id}>
                                <td>User #{item.userId}</td>
                                <td><strong>{item.requestedRole}</strong></td>
                                <td>{item.reason}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        background: item.status === "APPROVED" ? "#d1fae5" : item.status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                                        color: item.status === "APPROVED" ? "#065f46" : item.status === "REJECTED" ? "#991b1b" : "#92400e"
                                    }}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    {(role === "SYSTEM_ADMINISTRATOR" || role === "DEPARTMENT_ADMINISTRATOR") && item.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button onClick={() => approveRequest(item.id)} style={{ background: "#10b981", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Approve</button>
                                            <button onClick={() => rejectRequest(item.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RoleRequest;