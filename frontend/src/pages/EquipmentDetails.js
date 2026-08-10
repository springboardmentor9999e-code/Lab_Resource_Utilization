import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentUrl, getImageUrl, getFallbackImage } from "../components/EquipmentCard";
import { FaFilePdf, FaBookmark, FaArrowLeft } from "react-icons/fa";
import "../styles/dashboard.css";

function EquipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:8080/api/equipment/${id}`)
            .then((response) => {
                setEquipment(response.data);
            })
            .catch((err) => console.error("Error loading equipment details:", err));
    }, [id]);

    if (!equipment) {
        return (
            <div className="dashboard" style={{ textAlign: "center", padding: "60px" }}>
                <h2>Loading equipment specifications...</h2>
            </div>
        );
    }

    const name = equipment.equipmentName || "Unnamed Equipment";
    const category = equipment.category || "General";
    const imgSrc = getImageUrl(equipment.image, name, category);
    const docUrl = getDocumentUrl(equipment.documentUrl, name, category);

    return (
        <div className="dashboard">
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "20px"
                }}
            >
                <FaArrowLeft /> Back to Equipment Catalog
            </button>

            <div className="chart-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", padding: "35px" }}>
                <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                    <img
                        src={imgSrc}
                        alt={name}
                        style={{ width: "100%", height: "340px", objectFit: "cover" }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getFallbackImage(name, category);
                        }}
                    />
                </div>

                <div>
                    <span style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: equipment.availableQuantity > 0 ? "#d1fae5" : "#fee2e2",
                        color: equipment.availableQuantity > 0 ? "#065f46" : "#991b1b",
                        display: "inline-block",
                        marginBottom: "12px"
                    }}>
                        {equipment.availableQuantity > 0 ? "AVAILABLE" : "UNAVAILABLE"}
                    </span>

                    <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", color: "#0f172a" }}>{name}</h1>
                    <p style={{ color: "#64748b", margin: "0 0 20px 0", fontSize: "15px" }}>Category: <strong>{category}</strong></p>

                    <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#334155" }}>Equipment Description</h4>
                        <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>{equipment.description || "High-precision laboratory equipment available for research & training sessions."}</p>
                    </div>

                    <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
                        <div style={{ background: "#eff6ff", padding: "14px 20px", borderRadius: "12px" }}>
                            <small style={{ color: "#2563eb", fontWeight: "bold" }}>Total Quantity</small>
                            <h3 style={{ margin: "4px 0 0 0", color: "#1e40af" }}>{equipment.quantity || 1}</h3>
                        </div>
                        <div style={{ background: "#d1fae5", padding: "14px 20px", borderRadius: "12px" }}>
                            <small style={{ color: "#059669", fontWeight: "bold" }}>Available Quantity</small>
                            <h3 style={{ margin: "4px 0 0 0", color: "#065f46" }}>{equipment.availableQuantity || 0}</h3>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                        <button
                            onClick={() => navigate("/booking", { state: { equipmentId: equipment.id, equipmentName: name } })}
                            disabled={equipment.availableQuantity <= 0}
                            style={{
                                background: "#2563eb",
                                color: "white",
                                border: "none",
                                padding: "12px 24px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <FaBookmark /> Book Equipment Now
                        </button>

                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                border: "1px solid #cbd5e1",
                                background: "white",
                                color: "#334155",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                fontWeight: "600",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <FaFilePdf style={{ color: "#ef4444" }} /> View User Manual PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EquipmentDetails;