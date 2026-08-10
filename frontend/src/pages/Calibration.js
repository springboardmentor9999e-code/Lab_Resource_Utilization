import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/calibration.css";
import "../styles/dashboard.css";

function Calibration() {
    const [calibrations, setCalibrations] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [file, setFile] = useState(null);

    const [form, setForm] = useState({
        resourceId: "",
        calibrationDate: "",
        nextDueDate: "",
        performedBy: "",
        remarks: "",
        status: "Completed"
    });

    const API = "http://localhost:8080/api";

    useEffect(() => {
        loadCalibration();
        loadEquipment();
    }, []);

    const loadCalibration = () => {
        axios.get(`${API}/calibration`)
            .then(res => setCalibrations(res.data))
            .catch(err => console.log(err));
    };

    const loadEquipment = () => {
        axios.get(`${API}/equipment`)
            .then(res => setEquipment(res.data))
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const saveCalibration = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("resourceId", form.resourceId);
        formData.append("calibrationDate", form.calibrationDate);
        formData.append("nextDueDate", form.nextDueDate);
        formData.append("performedBy", form.performedBy);
        formData.append("remarks", form.remarks);
        formData.append("status", form.status);

        if (file) {
            formData.append("certificateFile", file);
        }

        try {
            await axios.post(`${API}/calibration`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Calibration Saved Successfully");
            loadCalibration();
            setForm({
                resourceId: "",
                calibrationDate: "",
                nextDueDate: "",
                performedBy: "",
                remarks: "",
                status: "Completed"
            });
            setFile(null);
        } catch (error) {
            console.log(error);
            alert("Error saving calibration");
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Equipment Calibration & Compliance</h1>
                <p>Log calibration records, track scheduled due dates, and manage compliance certificates</p>
            </div>

            <div className="chart-card" style={{ maxWidth: "680px", margin: "0 auto 30px auto" }}>
                <h3>Record Calibration & Certification</h3>
                <form onSubmit={saveCalibration} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Select Equipment</label>
                        <select
                            name="resourceId"
                            value={form.resourceId}
                            onChange={handleChange}
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="">-- Choose Equipment --</option>
                            {equipment.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.equipmentName} ({item.category || "General"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Calibration Date</label>
                            <input
                                type="date"
                                name="calibrationDate"
                                value={form.calibrationDate}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Next Due Date</label>
                            <input
                                type="date"
                                name="nextDueDate"
                                value={form.nextDueDate}
                                onChange={handleChange}
                                required
                                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Performed By</label>
                        <input
                            type="text"
                            name="performedBy"
                            value={form.performedBy}
                            onChange={handleChange}
                            placeholder="Certifying Technician / Organization"
                            required
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Upload Calibration Certificate</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            onChange={handleFileChange}
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Remarks</label>
                        <textarea
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            placeholder="Enter calibration findings and tolerances..."
                            rows="2"
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                        >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "12px",
                            borderRadius: "10px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginTop: "10px"
                        }}
                    >
                        Save Calibration Record
                    </button>
                </form>
            </div>

            <div className="chart-card">
                <h3>Calibration Log History</h3>
                <table className="recent-table">
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Calibration Date</th>
                            <th>Next Due Date</th>
                            <th>Performed By</th>
                            <th>Certificate</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calibrations.map((cal) => (
                            <tr key={cal.calibrationId}>
                                <td>
                                    <strong>
                                        {equipment.find(e => e.id === cal.resourceId)?.equipmentName || `Equipment #${cal.resourceId}`}
                                    </strong>
                                </td>
                                <td>{cal.calibrationDate}</td>
                                <td>{cal.nextDueDate}</td>
                                <td>{cal.performedBy}</td>
                                <td>{cal.certificateFile ? cal.certificateFile : "No File Uploaded"}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        background: cal.status === "Completed" ? "#d1fae5" : "#fee2e2",
                                        color: cal.status === "Completed" ? "#065f46" : "#991b1b"
                                    }}>
                                        {cal.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Calibration;