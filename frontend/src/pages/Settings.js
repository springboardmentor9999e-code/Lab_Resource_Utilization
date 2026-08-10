import React, { useState } from "react";
import {
    FaUser,
    FaBell,
    FaSave,
    FaCheckCircle
} from "react-icons/fa";
import "../styles/dashboard.css";

function Settings() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [form, setForm] = useState({
        name: user.name || "Lab User",
        email: user.email || "user@labplatform.org",
        department: user.department || "Biotechnology",
        emailNotifications: true,
        calibrationReminders: true,
        maintenanceAlerts: true
    });

    const [savedMsg, setSavedMsg] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>User & Platform Settings</h1>
                <p>Manage your account settings, department role preferences, and notification triggers</p>
            </div>

            {savedMsg && (
                <div style={{
                    background: "#d1fae5",
                    color: "#065f46",
                    padding: "14px 20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontWeight: "bold"
                }}>
                    <FaCheckCircle /> Settings saved successfully!
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
                {/* Profile Settings Card */}
                <div className="chart-card">
                    <h3><FaUser style={{ marginRight: "10px", color: "#2563eb" }} /> Account & Department Information</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#334155" }}>Department</label>
                            <input
                                type="text"
                                name="department"
                                value={form.department}
                                onChange={handleChange}
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1"
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <FaSave /> Save Profile Changes
                        </button>
                    </form>
                </div>

                {/* Notifications & System Preferences */}
                <div className="chart-card">
                    <h3><FaBell style={{ marginRight: "10px", color: "#2563eb" }} /> Alert & Reminder Triggers</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <label style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", cursor: "pointer" }}>
                            <div>
                                <strong>Email Notifications</strong>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Receive email updates for booking approvals & inter-institution requests</p>
                            </div>
                            <input
                                type="checkbox"
                                name="emailNotifications"
                                checked={form.emailNotifications}
                                onChange={handleChange}
                                style={{ transform: "scale(1.3)" }}
                            />
                        </label>

                        <label style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", cursor: "pointer" }}>
                            <div>
                                <strong>Calibration Reminders</strong>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Alert 14 days before equipment calibration certificate expires</p>
                            </div>
                            <input
                                type="checkbox"
                                name="calibrationReminders"
                                checked={form.calibrationReminders}
                                onChange={handleChange}
                                style={{ transform: "scale(1.3)" }}
                            />
                        </label>

                        <label style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", cursor: "pointer" }}>
                            <div>
                                <strong>Maintenance Work Orders</strong>
                                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>Notify when equipment maintenance status is set to IN_PROGRESS</p>
                            </div>
                            <input
                                type="checkbox"
                                name="maintenanceAlerts"
                                checked={form.maintenanceAlerts}
                                onChange={handleChange}
                                style={{ transform: "scale(1.3)" }}
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;