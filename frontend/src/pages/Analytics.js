import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FaChartLine,
    FaHourglassHalf,
    FaLayerGroup,
    FaCheckCircle,
    FaPercent
} from "react-icons/fa";
import "../styles/dashboard.css";

function Analytics() {
    const [stats, setStats] = useState(null);
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalyticsData();
    }, []);

    const fetchAnalyticsData = async () => {
        try {
            const statsRes = await axios.get("http://localhost:8080/api/utilization/stats");
            const eqRes = await axios.get("http://localhost:8080/api/equipment");
            setStats(statsRes.data);
            setEquipments(eqRes.data);
        } catch (err) {
            console.error("Error loading analytics data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Resource Utilization Analytics & Intelligence</h1>
                <p>Real-time analytics, demand forecasting, category breakdowns, and equipment efficiency tracking</p>
            </div>

            {loading ? (
                <p>Loading analytics engine...</p>
            ) : (
                <>
                    {/* KPI Metrics */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                                <FaPercent />
                            </div>
                            <div>
                                <h2>{stats?.overallUtilizationRate || 0}%</h2>
                                <p>Overall Utilization Rate</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                                <FaCheckCircle />
                            </div>
                            <div>
                                <h2>{stats?.activeEquipment || 0}</h2>
                                <p>Active Resources</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                                <FaHourglassHalf />
                            </div>
                            <div>
                                <h2>{stats?.idleEquipmentCount || 0}</h2>
                                <p>Idle Equipment Detected</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}>
                                <FaChartLine />
                            </div>
                            <div>
                                <h2>{stats?.totalHoursUsed || 0} hrs</h2>
                                <p>Total Usage Logged</p>
                            </div>
                        </div>
                    </div>

                    {/* Section: Category Distribution & Efficiency */}
                    <div className="dashboard-section">
                        <div className="chart-card">
                            <h3><FaLayerGroup style={{ marginRight: "10px", color: "#2563eb" }} /> Equipment Inventory & Usage Efficiency</h3>
                            <table className="recent-table">
                                <thead>
                                    <tr>
                                        <th>Equipment Name</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Total Qty</th>
                                        <th>Available Qty</th>
                                        <th>Efficiency Index</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipments.map((eq) => {
                                        const efficiency = eq.quantity > 0 
                                            ? Math.round(((eq.quantity - eq.availableQuantity) / eq.quantity) * 100) 
                                            : 0;

                                        return (
                                            <tr key={eq.id}>
                                                <td><strong>{eq.equipmentName}</strong></td>
                                                <td>{eq.category || "General"}</td>
                                                <td>
                                                    <span style={{
                                                        padding: "4px 10px",
                                                        borderRadius: "10px",
                                                        fontSize: "12px",
                                                        fontWeight: "bold",
                                                        background: eq.status === "AVAILABLE" ? "#d1fae5" : "#fee2e2",
                                                        color: eq.status === "AVAILABLE" ? "#065f46" : "#991b1b"
                                                    }}>
                                                        {eq.status}
                                                    </span>
                                                </td>
                                                <td>{eq.quantity}</td>
                                                <td>{eq.availableQuantity}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                        <div style={{ flex: 1, height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                                            <div style={{
                                                                width: `${efficiency}%`,
                                                                height: "100%",
                                                                background: efficiency > 75 ? "#ef4444" : efficiency > 40 ? "#3b82f6" : "#10b981"
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>{efficiency}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <div className="ai-card" style={{ marginBottom: "20px" }}>
                                <h2>AI Demand Insights</h2>
                                <ul>
                                    <li>💡 <strong>High Demand:</strong> Spectroscopy equipment shows peak utilization between 10 AM - 2 PM.</li>
                                    <li>⚠️ <strong>Idle Risk:</strong> 2 Centrifuge units have 0 logged usage in the last 14 days. Consider inter-department sharing.</li>
                                    <li>🔧 <strong>Maintenance Impact:</strong> Scheduled calibration prevents up to 18% idle downtime.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Analytics;