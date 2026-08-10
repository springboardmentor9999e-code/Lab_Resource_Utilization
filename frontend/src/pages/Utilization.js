import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/utilization.css";
import "../styles/dashboard.css";

function Utilization() {
    const [utilizations, setUtilizations] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [users, setUsers] = useState([]);

    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        bookingId: "",
        equipmentId: "",
        userId: "",
        usageDate: "",
        hoursUsed: "",
        remarks: ""
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        fetchUtilizations();
        fetchBookings();
        fetchEquipment();
        fetchUsers();
    }, []);

    const fetchUtilizations = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/utilization");
            setUtilizations(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/bookings");
            setBookings(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchEquipment = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/equipment");
            setEquipment(res.data);
        } catch (err) {
            console.log("Equipment Error:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/users");
            setUsers(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:8080/api/utilization/${editingId}`, form);
            } else {
                await axios.post("http://localhost:8080/api/utilization", form);
            }
            setEditingId(null);
            setForm(emptyForm);
            fetchUtilizations();
        } catch (err) {
            console.log(err);
            alert("Failed to save utilization.");
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.utilizationId);
        setForm({
            bookingId: item.bookingId || "",
            equipmentId: item.equipmentId || "",
            userId: item.userId || "",
            usageDate: item.usageDate || "",
            hoursUsed: item.hoursUsed || "",
            remarks: item.remarks || ""
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this utilization record?")) {
            try {
                await axios.delete(`http://localhost:8080/api/utilization/${id}`);
                fetchUtilizations();
            } catch (err) {
                console.log(err);
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Equipment Utilization Tracking</h1>
                <p>Log equipment operational hours, link bookings, and manage utilization records</p>
            </div>

            <div className="chart-card" style={{ maxWidth: "680px", margin: "0 auto 30px auto" }}>
                <h3>Log Equipment Usage Hours</h3>
                <form className="utilization-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Select Booking</label>
                        <select name="bookingId" value={form.bookingId} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                            <option value="">Choose Booking</option>
                            {bookings.map((b) => (
                                <option key={b.id} value={b.id}>Booking #{b.id} - Date: {b.bookingDate}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Select Equipment</label>
                            <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <option value="">Choose Equipment</option>
                                {equipment.map((item) => (
                                    <option key={item.id} value={item.id}>{item.equipmentName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Select User</label>
                            <select name="userId" value={form.userId} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <option value="">Choose Researcher</option>
                                {users.map((u) => (
                                    <option key={u.userId} value={u.userId}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Usage Date</label>
                            <input type="date" name="usageDate" value={form.usageDate} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Hours Used</label>
                            <input type="number" step="0.5" name="hoursUsed" placeholder="e.g. 3.5" value={form.hoursUsed} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "6px", fontWeight: "600" }}>Remarks</label>
                        <textarea name="remarks" placeholder="Enter session observations..." value={form.remarks} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                    </div>

                    <button type="submit" style={{ background: "#2563eb", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>
                        {editingId ? "Update Utilization" : "Add Utilization Record"}
                    </button>
                </form>
            </div>

            <div className="chart-card">
                <h3>Utilization History</h3>
                <table className="recent-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Booking</th>
                            <th>Equipment</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Hours</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {utilizations.map((u) => {
                            const equipmentName = equipment.find((e) => e.id === Number(u.equipmentId))?.equipmentName || "-";
                            const userName = users.find((usr) => usr.userId === Number(u.userId))?.name || "-";

                            return (
                                <tr key={u.utilizationId}>
                                    <td><strong>#{u.utilizationId}</strong></td>
                                    <td>Booking #{u.bookingId}</td>
                                    <td>{equipmentName}</td>
                                    <td>{userName}</td>
                                    <td>{u.usageDate}</td>
                                    <td>{u.hoursUsed} hrs</td>
                                    <td>{u.remarks || "N/A"}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button onClick={() => handleEdit(u)} style={{ background: "#f59e0b", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Edit</button>
                                            <button onClick={() => handleDelete(u.utilizationId)} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Utilization;