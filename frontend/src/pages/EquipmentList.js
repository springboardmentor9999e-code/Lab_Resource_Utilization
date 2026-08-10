import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import EquipmentCard from "../components/EquipmentCard";
import { FaPlus, FaSearch, FaThLarge, FaList, FaEdit, FaTrash, FaInfoCircle, FaBookmark, FaFlask } from "react-icons/fa";
import "../styles/equipment.css";
import "../styles/dashboard.css";

function EquipmentList() {
    const navigate = useNavigate();
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("cards");

    // Search & Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const role = localStorage.getItem("role");
    const department = localStorage.getItem("department");

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        setLoading(true);
        try {
            let response;
            if (role === "Institute Administrator" || role === "SYSTEM_ADMINISTRATOR" || !department) {
                response = await axios.get("http://localhost:8080/api/equipment");
            } else {
                try {
                    response = await axios.get(`http://localhost:8080/api/equipment/department/${department}`);
                } catch (e) {
                    response = await axios.get("http://localhost:8080/api/equipment");
                }
            }
            setEquipmentList(response.data || []);
        } catch (error) {
            console.error("Error loading equipment list:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteEquipment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this equipment from inventory?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/equipment/${id}`);
            alert("Equipment deleted successfully!");
            loadEquipment();
        } catch (error) {
            console.error("Error deleting equipment:", error);
            alert("Failed to delete equipment.");
        }
    };

    const handleEdit = (id) => {
        navigate(`/equipment/edit/${id}`);
    };

    const categories = ["ALL", ...Array.from(new Set(equipmentList.map(item => item.category).filter(Boolean)))];

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
            {/* Header */}
            <div className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                <div>
                    <h1>Equipment Inventory & Management</h1>
                    <p>Manage, catalog, edit, and track all institutional laboratory equipment records</p>
                </div>
                <Link
                    to="/equipment/add"
                    style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                    }}
                >
                    <FaPlus /> Add New Equipment
                </Link>
            </div>

            {/* Filter & View Mode Bar */}
            <div className="chart-card" style={{ marginBottom: "25px", padding: "18px 24px" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", flex: 1 }}>
                        {/* Search */}
                        <div style={{ position: "relative", minWidth: "240px", flex: 1 }}>
                            <input
                                type="text"
                                placeholder="Search equipment..."
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

                        {/* Category */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ padding: "11px 15px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white" }}
                        >
                            <option value="ALL">All Categories</option>
                            {categories.filter(c => c !== "ALL").map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {/* Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ padding: "11px 15px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", background: "white" }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="UNAVAILABLE">Unavailable</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                    </div>

                    {/* View Switcher */}
                    <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
                        <button
                            onClick={() => setViewMode("cards")}
                            style={{
                                border: "none",
                                background: viewMode === "cards" ? "#ffffff" : "transparent",
                                color: viewMode === "cards" ? "#2563eb" : "#64748b",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <FaThLarge /> Cards
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            style={{
                                border: "none",
                                background: viewMode === "table" ? "#ffffff" : "transparent",
                                color: viewMode === "table" ? "#2563eb" : "#64748b",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <FaList /> Table
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            {loading ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "50px" }}>
                    <p style={{ color: "#64748b" }}>Loading equipment records...</p>
                </div>
            ) : filteredEquipment.length === 0 ? (
                <div className="chart-card" style={{ textAlign: "center", padding: "50px" }}>
                    <FaFlask style={{ fontSize: "40px", color: "#94a3b8", marginBottom: "10px" }} />
                    <p style={{ color: "#64748b" }}>No equipment records found.</p>
                </div>
            ) : viewMode === "cards" ? (
                <div className="equipment-grid">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id || item.equipmentId}
                            equipment={item}
                            onEdit={handleEdit}
                            onDelete={deleteEquipment}
                            showAdminActions={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="chart-card" style={{ padding: "0", overflow: "hidden" }}>
                    <table className="recent-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Equipment Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Available</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipment.map((item) => {
                                const id = item.id || item.equipmentId;
                                const isAvail = (item.availableQuantity || 0) > 0;
                                return (
                                    <tr key={id}>
                                        <td><strong>#{id}</strong></td>
                                        <td><strong>{item.equipmentName}</strong></td>
                                        <td>{item.category || "General"}</td>
                                        <td>{item.quantity || 1}</td>
                                        <td>{item.availableQuantity || 0}</td>
                                        <td>
                                            <span style={{
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "bold",
                                                background: isAvail ? "#d1fae5" : "#fee2e2",
                                                color: isAvail ? "#065f46" : "#991b1b"
                                            }}>
                                                {isAvail ? "AVAILABLE" : "UNAVAILABLE"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    onClick={() => navigate(`/equipment/${id}`)}
                                                    style={{ border: "1px solid #cbd5e1", background: "white", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                                                    title="View Details"
                                                >
                                                    <FaInfoCircle />
                                                </button>
                                                <button
                                                    onClick={() => navigate("/booking", { state: { equipmentId: id, equipmentName: item.equipmentName } })}
                                                    disabled={!isAvail}
                                                    style={{ border: "none", background: isAvail ? "#2563eb" : "#cbd5e1", color: "white", padding: "5px 10px", borderRadius: "8px", cursor: isAvail ? "pointer" : "not-allowed", fontSize: "12px" }}
                                                    title="Book Now"
                                                >
                                                    <FaBookmark />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(id)}
                                                    style={{ border: "none", background: "#f59e0b", color: "white", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                                                    title="Edit Equipment"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => deleteEquipment(id)}
                                                    style={{ border: "none", background: "#ef4444", color: "white", padding: "5px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px" }}
                                                    title="Delete Equipment"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default EquipmentList;