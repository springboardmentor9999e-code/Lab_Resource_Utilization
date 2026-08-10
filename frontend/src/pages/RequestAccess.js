import React, { useState, useEffect } from "react";
import axios from "axios";
import { createRequest } from "../services/sharingService";
import { FaProjectDiagram, FaPaperPlane } from "react-icons/fa";
import "../styles/dashboard.css";

function RequestAccess() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [institutionList, setInstitutionList] = useState([]);

    const [formData, setFormData] = useState({
        equipmentId: "",
        requesterId: "",
        requesterInstitutionId: "1",
        ownerInstitutionId: "1",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: ""
    });

    useEffect(() => {
        fetchDropdowns();
    }, []);

    const fetchDropdowns = async () => {
        try {
            const eqRes = await axios.get("http://localhost:8080/api/equipment");
            const usrRes = await axios.get("http://localhost:8080/api/users");
            const instRes = await axios.get("http://localhost:8080/api/institutions");
            setEquipmentList(eqRes.data);
            setUserList(usrRes.data);
            setInstitutionList(instRes.data);
        } catch (err) {
            console.error("Error loading dropdown options:", err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createRequest(formData);
            alert("Inter-Institution Sharing Request Submitted Successfully!");
            setFormData({
                equipmentId: "",
                requesterId: "",
                requesterInstitutionId: "1",
                ownerInstitutionId: "1",
                bookingDate: "",
                startTime: "",
                endTime: "",
                purpose: ""
            });
        } catch (error) {
            console.error(error);
            alert("Failed to submit request.");
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Inter-Institution Resource Access Request</h1>
                <p>Submit shared access requests for external laboratory equipment across registered partner institutions</p>
            </div>

            <div className="chart-card" style={{ maxWidth: "680px", margin: "0 auto" }}>
                <h3><FaProjectDiagram style={{ marginRight: "10px", color: "#2563eb" }} /> Equipment Access Request Form</h3>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Select Equipment</label>
                        <select
                            name="equipmentId"
                            value={formData.equipmentId}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="">-- Choose Equipment --</option>
                            {equipmentList.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.equipmentName} ({item.category || 'General'})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Requester User</label>
                            <select
                                name="requesterId"
                                value={formData.requesterId}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            >
                                <option value="">-- Select Researcher --</option>
                                {userList.map(u => (
                                    <option key={u.userId} value={u.userId}>
                                        {u.name} ({u.department || 'Lab'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Requester Institution</label>
                            <select
                                name="requesterInstitutionId"
                                value={formData.requesterInstitutionId}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "11px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            >
                                <option value="1">Primary Research Institution</option>
                                {institutionList.map(inst => (
                                    <option key={inst.institutionId} value={inst.institutionId}>
                                        {inst.institutionName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Request Date</label>
                            <input
                                type="date"
                                name="bookingDate"
                                value={formData.bookingDate}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Research Purpose / Justification</label>
                        <textarea
                            name="purpose"
                            rows="3"
                            value={formData.purpose}
                            onChange={handleChange}
                            placeholder="Describe research goals and shared equipment usage justification..."
                            required
                            style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "12px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "15px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            marginTop: "10px"
                        }}
                    >
                        <FaPaperPlane /> Submit Inter-Institution Request
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RequestAccess;