import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/admin.css";
import "../styles/dashboard.css";

function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userResponse = await axios.get("http://localhost:8080/api/users");
            const equipmentResponse = await axios.get("http://localhost:8080/api/equipment");
            const bookingResponse = await axios.get("http://localhost:8080/api/bookings");
            setUsers(userResponse.data);
            setEquipment(equipmentResponse.data);
            setBookings(bookingResponse.data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>System Administrator Dashboard</h1>
                <p>Global system oversight, user account management, and institutional platform metrics</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#2563eb" }}>👥</div>
                    <div>
                        <h2>{users.length}</h2>
                        <p>Total Registered Users</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#10b981" }}>🔬</div>
                    <div>
                        <h2>{equipment.length}</h2>
                        <p>Total Equipment Units</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "#8b5cf6" }}>📅</div>
                    <div>
                        <h2>{bookings.length}</h2>
                        <p>Total Reservations</p>
                    </div>
                </div>
            </div>

            <div className="chart-card">
                <h3>Registered Platform Users</h3>
                <table className="recent-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id || user.userId}>
                                <td><strong>#{user.id || user.userId}</strong></td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span style={{
                                        padding: "4px 10px",
                                        borderRadius: "10px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        background: "#eff6ff",
                                        color: "#1e40af"
                                    }}>
                                        {user.role}
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

export default AdminPanel;