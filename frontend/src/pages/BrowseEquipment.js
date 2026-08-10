import React, { useEffect, useState } from "react";
import axios from "axios";
import EquipmentCard from "../components/EquipmentCard";
import { FaSearch, FaFilter, FaFlask, FaSpinner } from "react-icons/fa";
import "../styles/equipment.css";
import "../styles/dashboard.css";

function BrowseEquipment() {
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Search
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:8080/api/equipment");
            setEquipmentList(response.data || []);
        } catch (err) {
            console.error("Error loading browse equipment catalog:", err);
            setError("Failed to load equipment catalog. Please check backend connection.");
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories for dynamic filter options
    const categories = ["ALL", ...Array.from(new Set(equipmentList.map(item => item.category).filter(Boolean)))];

    // Filter Logic
    const filteredEquipment = equipmentList.filter((item) => {
        const name = (item.equipmentName || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        const searchLower = search.toLowerCase();
        
        const matchesSearch = name.includes(searchLower) || cat.includes(searchLower);
        const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;

        const rawStatus = (item.status || "").toUpperCase();
        const availQty = item.availableQuantity !== undefined && item.availableQuantity !== null ? item.availableQuantity : 0;
        
        let matchesStatus = true;
        if (statusFilter === "AVAILABLE") {
            matchesStatus = availQty > 0 && rawStatus !== "UNAVAILABLE" && rawStatus !== "MAINTENANCE";
        } else if (statusFilter === "UNAVAILABLE") {
            matchesStatus = availQty <= 0 || rawStatus === "UNAVAILABLE";
        } else if (statusFilter === "MAINTENANCE") {
            matchesStatus = rawStatus === "MAINTENANCE";
        } else if (statusFilter === "IN_USE") {
            matchesStatus = rawStatus === "IN_USE" || rawStatus === "IN USE";
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Browse Equipment Catalog</h1>
                <p>Explore all available university and institutional laboratory resources, check real-time availability, and reserve equipment</p>
            </div>

            {/* Filter & Search Bar */}
            <div className="chart-card" style={{ marginBottom: "25px", padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* Search Box */}
                    <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
                        <input
                            type="text"
                            placeholder="Search equipment by name or category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px 12px 42px",
                                borderRadius: "12px",
                                border: "1px solid #cbd5e1",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />
                        <FaSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FaFilter style={{ color: "#64748b" }} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white", cursor: "pointer" }}
                        >
                            <option value="ALL">All Categories</option>
                            {categories.filter(c => c !== "ALL").map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Availability / Status Filter */}
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white", cursor: "pointer" }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                            <option value="MAINTENANCE">Maintenance</option>
                            <option value="IN_USE">In Use</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "60px" }}>
                    <FaSpinner className="spinner" style={{ fontSize: "36px", color: "#2563eb", marginBottom: "12px" }} />
                    <p style={{ color: "#64748b", fontWeight: "600" }}>Loading Equipment Catalog...</p>
                </div>
            ) : error ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "50px", borderLeft: "4px solid #ef4444" }}>
                    <p style={{ color: "#ef4444", fontWeight: "bold", fontSize: "16px" }}>{error}</p>
                    <button
                        onClick={loadEquipment}
                        style={{ marginTop: "12px", background: "#2563eb", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", cursor: "pointer" }}
                    >
                        Retry Loading
                    </button>
                </div>
            ) : filteredEquipment.length === 0 ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "60px" }}>
                    <FaFlask style={{ fontSize: "48px", color: "#94a3b8", marginBottom: "12px" }} />
                    <h3>No Equipment Found</h3>
                    <p style={{ color: "#64748b" }}>No laboratory equipment matches your search query or selected filters.</p>
                </div>
            ) : (
                <div className="equipment-grid">
                    {filteredEquipment.map((equipment) => (
                        <EquipmentCard
                            key={equipment.id || equipment.equipmentId}
                            equipment={equipment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default BrowseEquipment;