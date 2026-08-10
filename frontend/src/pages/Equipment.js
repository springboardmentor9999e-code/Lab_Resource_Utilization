import React, { useEffect, useState } from "react";
import axios from "axios";
import EquipmentCard from "../components/EquipmentCard";
import { FaSearch, FaFlask, FaSpinner } from "react-icons/fa";
import "../styles/equipment.css";
import "../styles/dashboard.css";

function Equipment() {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/equipment")
            .then((response) => {
                setEquipment(response.data || []);
            })
            .catch((error) => {
                console.error("Error fetching equipment:", error);
            })
            .finally(() => setLoading(false));
    }, []);

    const categories = ["", ...Array.from(new Set(equipment.map(item => item.category).filter(Boolean)))];

    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch = item.equipmentName.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "" || item.category === category;
        const matchesStatus = status === "" || (status === "AVAILABLE" ? item.availableQuantity > 0 : item.availableQuantity === 0);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Available Equipment Catalog</h1>
                <p>Browse high-precision laboratory resources, view technical specifications, and make instant bookings</p>
            </div>

            <div className="chart-card" style={{ marginBottom: "25px", padding: "18px 24px" }}>
                <div className="filter-container" style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
                        <input
                            type="text"
                            placeholder="Search equipment by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "11px 15px 11px 40px",
                                borderRadius: "12px",
                                border: "1px solid #cbd5e1",
                                fontSize: "14px"
                            }}
                        />
                        <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ padding: "11px 15px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white" }}
                    >
                        <option value="">All Categories</option>
                        {categories.filter(Boolean).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{ padding: "11px 15px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white" }}
                    >
                        <option value="">All Status</option>
                        <option value="AVAILABLE">Available Only</option>
                        <option value="UNAVAILABLE">Unavailable Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "50px" }}>
                    <FaSpinner className="spinner" style={{ fontSize: "32px", color: "#2563eb", marginBottom: "10px" }} />
                    <p style={{ color: "#64748b" }}>Loading Equipment Catalog...</p>
                </div>
            ) : filteredEquipment.length === 0 ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "50px" }}>
                    <FaFlask style={{ fontSize: "48px", color: "#94a3b8", marginBottom: "12px" }} />
                    <h3>No Equipment Matches Found</h3>
                    <p style={{ color: "#64748b" }}>Try resetting your search query or filters.</p>
                </div>
            ) : (
                <div className="equipment-grid">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id || item.equipmentId}
                            equipment={item}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Equipment;