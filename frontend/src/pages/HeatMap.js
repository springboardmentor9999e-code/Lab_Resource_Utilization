import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HeatMap.css";

function HeatMap() {
    const [heatMapData, setHeatMapData] = useState([]);
    const [idleList, setIdleList] = useState([]);

    useEffect(() => {
        loadHeatMap();
        loadIdleEquipment();
    }, []);

    const loadHeatMap = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/dashboard/heatmap");
            setHeatMapData(response.data);
        } catch (error) {
            console.log("Error loading heatmap:", error);
        }
    };

    const loadIdleEquipment = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/utilization/idle");
            setIdleList(response.data);
        } catch (error) {
            console.log("Error loading idle equipment:", error);
        }
    };

    const getColor = (count) => {
        if (count === 0) return "#ebedf0";
        if (count <= 2) return "#9be9a8";
        if (count <= 5) return "#40c463";
        if (count <= 10) return "#30a14e";
        return "#216e39";
    };

    return (
        <div className="heatmap-page" style={{ padding: "10px 0" }}>
            <div style={{ marginBottom: "25px" }}>
                <h2>Equipment Utilization Heat Map & Idle Detection</h2>
                <p style={{ color: "#64748b" }}>Visual representation of weekly booking intensity and unutilized resource detection</p>
            </div>

            <div className="legend" style={{ marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span>Low Usage</span>
                <div className="box" style={{ background: "#ebedf0", width: "20px", height: "20px", borderRadius: "4px" }}></div>
                <div className="box" style={{ background: "#9be9a8", width: "20px", height: "20px", borderRadius: "4px" }}></div>
                <div className="box" style={{ background: "#40c463", width: "20px", height: "20px", borderRadius: "4px" }}></div>
                <div className="box" style={{ background: "#30a14e", width: "20px", height: "20px", borderRadius: "4px" }}></div>
                <div className="box" style={{ background: "#216e39", width: "20px", height: "20px", borderRadius: "4px" }}></div>
                <span>Peak Usage</span>
            </div>

            <div style={{ background: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", marginBottom: "30px" }}>
                <h3>Weekly Intensity Grid</h3>
                <table className="heatmap-table" style={{ width: "100%", marginTop: "15px" }}>
                    <thead>
                        <tr>
                            <th style={{ width: "250px", textAlign: "left", padding: "12px" }}>Equipment Name</th>
                            <th>
                                <div className="days-header" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", textAlign: "center" }}>
                                    <div>Mon</div>
                                    <div>Tue</div>
                                    <div>Wed</div>
                                    <div>Thu</div>
                                    <div>Fri</div>
                                    <div>Sat</div>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {heatMapData.map((item, index) => (
                            <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                <td style={{ padding: "12px", fontWeight: "600", color: "#334155" }}>{item.equipmentName}</td>
                                <td>
                                    <div className="cells" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", padding: "8px" }}>
                                        {[...Array(6)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="cell"
                                                style={{
                                                    height: "28px",
                                                    borderRadius: "6px",
                                                    background: i < Math.min(item.bookingCount, 6) ? getColor(item.bookingCount) : "#ebedf0",
                                                    transition: "0.3s"
                                                }}
                                                title={`${item.equipmentName}: ${item.bookingCount} bookings`}
                                            />
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Idle Equipment Section */}
            <div style={{ background: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <h3 style={{ color: "#ef4444" }}>⚠️ Detected Idle Equipment (Zero Usage Logged)</h3>
                <p style={{ color: "#64748b", fontSize: "14px" }}>These equipment units currently have zero active utilization entries and are recommended for inter-institution sharing.</p>

                {idleList.length === 0 ? (
                    <p style={{ color: "#10b981", fontWeight: "bold" }}>All laboratory equipment units are actively utilized!</p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "15px", marginTop: "15px" }}>
                        {idleList.map(eq => (
                            <div key={eq.id} style={{
                                border: "1px solid #fee2e2",
                                background: "#fff5f5",
                                borderRadius: "12px",
                                padding: "15px"
                            }}>
                                <h4 style={{ margin: "0 0 5px 0", color: "#991b1b" }}>{eq.equipmentName}</h4>
                                <p style={{ margin: 0, fontSize: "13px", color: "#7f1d1d" }}>Category: {eq.category || "General"}</p>
                                <span style={{
                                    display: "inline-block",
                                    marginTop: "8px",
                                    padding: "3px 8px",
                                    background: "#fca5a5",
                                    color: "#7f1d1d",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: "bold"
                                }}>
                                    IDLE - AVAILABLE FOR SHARING
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HeatMap;