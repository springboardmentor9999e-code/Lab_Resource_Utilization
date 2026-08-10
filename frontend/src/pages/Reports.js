import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ScatterChart,
    Scatter,
    ZAxis
} from "recharts";
import "../styles/reports.css";
import "../styles/dashboard.css";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#64748b"];
const CAPACITY_HOURS_PER_EQUIPMENT = 160;

function Reports() {
    const [equipment, setEquipment] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [utilizations, setUtilizations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [equipmentResponse, bookingResponse, utilizationResponse] = await Promise.all([
                axios.get("http://localhost:8080/api/equipment"),
                axios.get("http://localhost:8080/api/bookings"),
                axios.get("http://localhost:8080/api/utilization")
            ]);

            setEquipment(equipmentResponse.data || []);
            setBookings(bookingResponse.data || []);
            setUtilizations(utilizationResponse.data || []);
        } catch (error) {
            console.error("Failed to load report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const approved = bookings.filter(b => b.status === "APPROVED").length;
    const pending = bookings.filter(b => b.status === "PENDING").length;
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length;

    const usageByEquipment = useMemo(() => {
        const usageMap = {};

        equipment.forEach(eq => {
            usageMap[String(eq.id)] = {
                id: eq.id,
                name: eq.equipmentName || `Equipment #${eq.id}`,
                category: eq.category || "General",
                hours: 0,
                sessions: 0,
                quantity: Number(eq.quantity || 0),
                availableQuantity: Number(eq.availableQuantity || 0),
                status: eq.status || "UNKNOWN"
            };
        });

        utilizations.forEach(record => {
            const id = String(record.equipmentId);
            if (!usageMap[id]) {
                usageMap[id] = {
                    id: record.equipmentId,
                    name: `Equipment #${record.equipmentId}`,
                    category: "General",
                    hours: 0,
                    sessions: 0,
                    quantity: 0,
                    availableQuantity: 0,
                    status: "UNKNOWN"
                };
            }

            usageMap[id].hours += Number(record.hoursUsed || 0);
            usageMap[id].sessions += 1;
        });

        return Object.values(usageMap).map(item => ({
            ...item,
            hours: Number(item.hours.toFixed(2)),
            utilizationRate: Number(Math.min(100, (item.hours / CAPACITY_HOURS_PER_EQUIPMENT) * 100).toFixed(1))
        }));
    }, [equipment, utilizations]);

    const equipmentUsageData = useMemo(
        () => usageByEquipment.filter(item => item.hours > 0).sort((a, b) => b.hours - a.hours),
        [usageByEquipment]
    );

    const barData = useMemo(
        () => usageByEquipment
            .slice()
            .sort((a, b) => b.utilizationRate - a.utilizationRate)
            .map(item => ({
                name: item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
                fullName: item.name,
                hours: item.hours,
                utilization: item.utilizationRate
            })),
        [usageByEquipment]
    );

    const dotData = useMemo(() => {
        const records = [];
        utilizations.forEach(record => {
            const eq = usageByEquipment.find(item => String(item.id) === String(record.equipmentId));
            if (eq) {
                records.push({
                    x: eq.name,
                    y: Number(record.hoursUsed || 0),
                    sessions: 1,
                    date: record.usageDate || ""
                });
            }
        });
        return records;
    }, [utilizations, usageByEquipment]);

    const totalHoursUsed = utilizations.reduce((sum, item) => sum + Number(item.hoursUsed || 0), 0);
    const activeEquipment = usageByEquipment.filter(item => item.hours > 0).length;
    const overallUtilization = equipment.length
        ? Math.min(100, (totalHoursUsed / (equipment.length * CAPACITY_HOURS_PER_EQUIPMENT)) * 100)
        : 0;

    return (
        <div className="dashboard reports-page">
            <div className="dashboard-header">
                <h1>Resource & Usage Reports</h1>
                <p>Equipment usage, utilization levels, booking activity, and operational performance</p>
            </div>

            {loading ? (
                <div className="chart-card reports-loading">Loading report data...</div>
            ) : (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "#2563eb" }}>📊</div>
                            <div><h2>{equipment.length}</h2><p>Total Equipment</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "#10b981" }}>⏱️</div>
                            <div><h2>{totalHoursUsed.toFixed(1)} hrs</h2><p>Total Hours Used</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "#8b5cf6" }}>📈</div>
                            <div><h2>{overallUtilization.toFixed(1)}%</h2><p>Overall Utilization</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "#f59e0b" }}>🔬</div>
                            <div><h2>{activeEquipment}</h2><p>Equipment Used</p></div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: "#ef4444" }}>📅</div>
                            <div><h2>{bookings.length}</h2><p>Total Bookings</p></div>
                        </div>
                    </div>

                    <div className="reports-chart-grid">
                        <div className="chart-card report-chart-card">
                            <div className="report-chart-heading">
                                <div>
                                    <h3>Equipment Usage Distribution</h3>
                                    <p>Share of total logged usage hours by equipment</p>
                                </div>
                            </div>
                            {equipmentUsageData.length ? (
                                <ResponsiveContainer width="100%" height={340}>
                                    <PieChart>
                                        <Pie
                                            data={equipmentUsageData}
                                            dataKey="hours"
                                            nameKey="name"
                                            cx="50%"
                                            cy="48%"
                                            outerRadius={110}
                                            innerRadius={55}
                                            paddingAngle={2}
                                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                        >
                                            {equipmentUsageData.map((entry, index) => (
                                                <Cell key={entry.id} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} hrs`, "Usage"]} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart message="No utilization records available yet." />}
                        </div>

                        <div className="chart-card report-chart-card">
                            <div className="report-chart-heading">
                                <div>
                                    <h3>Utilization by Equipment</h3>
                                    <p>Logged hours compared with a 160-hour reporting capacity</p>
                                </div>
                            </div>
                            {barData.length ? (
                                <ResponsiveContainer width="100%" height={340}>
                                    <BarChart data={barData} margin={{ top: 10, right: 15, left: 0, bottom: 55 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={75} />
                                        <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} />
                                        <Tooltip
                                            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                            formatter={(value, name) => [name === "utilization" ? `${value}%` : `${value} hrs`, name === "utilization" ? "Utilization" : "Hours Used"]}
                                        />
                                        <Legend />
                                        <Bar dataKey="utilization" name="Utilization %" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <EmptyChart message="No equipment data available." />}
                        </div>
                    </div>

                    <div className="chart-card report-chart-card report-dot-card">
                        <div className="report-chart-heading">
                            <div>
                                <h3>Usage Session Dot Plot</h3>
                                <p>Each dot represents one recorded equipment-use session; higher dots indicate longer sessions</p>
                            </div>
                        </div>
                        {dotData.length ? (
                            <ResponsiveContainer width="100%" height={380}>
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 70, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis
                                        type="category"
                                        dataKey="x"
                                        name="Equipment"
                                        allowDuplicatedCategory={false}
                                        angle={-35}
                                        textAnchor="end"
                                        height={90}
                                        interval={0}
                                    />
                                    <YAxis type="number" dataKey="y" name="Hours" unit=" hrs" />
                                    <ZAxis range={[90, 90]} />
                                    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [`${value} hrs`, name === "y" ? "Session Usage" : name]} />
                                    <Scatter name="Usage Sessions" data={dotData} fill="#8b5cf6" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        ) : <EmptyChart message="No usage sessions have been recorded yet." />}
                    </div>

                    <div className="reports-summary-grid">
                        <div className="chart-card">
                            <h3>Booking Status Summary</h3>
                            <div className="booking-status-list">
                                <StatusRow label="Approved" value={approved} className="approved" />
                                <StatusRow label="Pending" value={pending} className="pending" />
                                <StatusRow label="Cancelled" value={cancelled} className="cancelled" />
                            </div>
                        </div>

                        <div className="chart-card">
                            <h3>Equipment Utilization Details</h3>
                            <div className="table-wrapper">
                                <table className="recent-table">
                                    <thead>
                                        <tr>
                                            <th>Equipment</th>
                                            <th>Category</th>
                                            <th>Sessions</th>
                                            <th>Hours Used</th>
                                            <th>Utilization</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usageByEquipment
                                            .slice()
                                            .sort((a, b) => b.hours - a.hours)
                                            .map(item => (
                                                <tr key={item.id}>
                                                    <td><strong>{item.name}</strong></td>
                                                    <td>{item.category}</td>
                                                    <td>{item.sessions}</td>
                                                    <td>{item.hours.toFixed(1)} hrs</td>
                                                    <td>
                                                        <div className="utilization-cell">
                                                            <div className="utilization-track"><span style={{ width: `${item.utilizationRate}%` }} /></div>
                                                            <strong>{item.utilizationRate}%</strong>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function EmptyChart({ message }) {
    return <div className="empty-chart">{message}</div>;
}

function StatusRow({ label, value, className }) {
    return (
        <div className={`booking-status-row ${className}`}>
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export default Reports;
