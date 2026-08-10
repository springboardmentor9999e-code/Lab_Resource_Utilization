import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaInfoCircle, FaEdit, FaTrash, FaLayerGroup, FaFilePdf } from "react-icons/fa";
import "../styles/equipment.css";

const DEFAULT_PLACEHOLDERS = {
    biology: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80",
    measuring: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    electronics: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    general: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80"
};

export const getFallbackImage = (name = "", cat = "") => {
    const text = (name + " " + cat).toLowerCase();
    
    // Check for local uploaded equipment images first by name/type
    if (text.includes("centrifuge")) return "http://localhost:8080/uploads/images/centrifuge.jpg";
    if (text.includes("multimeter") || text.includes("meter")) return "http://localhost:8080/uploads/images/multimeter.jpg";
    if (text.includes("laptop") || text.includes("computer")) return "http://localhost:8080/uploads/images/laptop.jpg";
    if (text.includes("pipette") || text.includes("dropper")) return "http://localhost:8080/uploads/images/pipette.jpg";
    if (text.includes("projector") || text.includes("display")) return "http://localhost:8080/uploads/images/projector.jpg";

    if (text.includes("microscope") || text.includes("bio") || text.includes("cell")) {
        return DEFAULT_PLACEHOLDERS.biology;
    }
    if (text.includes("spectro") || text.includes("measure") || text.includes("scale")) {
        return DEFAULT_PLACEHOLDERS.measuring;
    }
    if (text.includes("electronic") || text.includes("physic") || text.includes("scope") || text.includes("circuit")) {
        return DEFAULT_PLACEHOLDERS.electronics;
    }
    return DEFAULT_PLACEHOLDERS.general;
};

export const getImageUrl = (imagePath, name = "", cat = "") => {
    if (!imagePath || typeof imagePath !== "string" || imagePath.trim() === "") {
        return getFallbackImage(name, cat);
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    // Clean leading slashes or upload prefix to format consistently
    let cleanPath = imagePath.trim();
    if (cleanPath.startsWith("uploads/")) {
        cleanPath = `/${cleanPath}`;
    } else if (!cleanPath.startsWith("/uploads/")) {
        if (cleanPath.startsWith("/images/")) {
            cleanPath = `/uploads${cleanPath}`;
        } else if (cleanPath.startsWith("images/")) {
            cleanPath = `/uploads/${cleanPath}`;
        } else {
            cleanPath = `/uploads/images/${cleanPath.replace(/^\/+/, '')}`;
        }
    }

    return `http://localhost:8080${cleanPath}`;
};

export const getDocumentUrl = (documentUrl, name = "", cat = "") => {
    if (documentUrl && typeof documentUrl === "string" && documentUrl.trim() !== "") {
        if (documentUrl.startsWith("http://") || documentUrl.startsWith("https://")) {
            return documentUrl;
        }
        const cleanPath = documentUrl.startsWith("/") ? documentUrl : `/${documentUrl}`;
        return `http://localhost:8080${cleanPath}`;
    }

    // Default manual documents in uploads/documents/
    const text = (name + " " + cat).toLowerCase();
    if (text.includes("laptop") || text.includes("computer")) {
        return "http://localhost:8080/uploads/documents/Dell_Laptop_guide.pdf";
    }
    if (text.includes("pipette") || text.includes("dropper") || text.includes("bio")) {
        return "http://localhost:8080/uploads/documents/pipette_guide.pdf";
    }
    if (text.includes("projector") || text.includes("display")) {
        return "http://localhost:8080/uploads/documents/projector_guide.pdf";
    }
    if (text.includes("centrifuge")) {
        return "http://localhost:8080/uploads/documents/centrifuge_guide.pdf";
    }
    if (text.includes("multimeter") || text.includes("meter")) {
        return "http://localhost:8080/uploads/documents/multimeter_guide.pdf";
    }

    return "http://localhost:8080/uploads/documents/Dell_Laptop_guide.pdf";
};

function EquipmentCard({ equipment, onEdit, onDelete, showAdminActions = false }) {
    const navigate = useNavigate();

    if (!equipment) return null;

    const id = equipment.id || equipment.equipmentId;
    const name = equipment.equipmentName || "Unnamed Equipment";
    const category = equipment.category || "General Laboratory";
    const totalQty = equipment.quantity !== undefined && equipment.quantity !== null ? equipment.quantity : 1;
    const availQty = equipment.availableQuantity !== undefined && equipment.availableQuantity !== null ? equipment.availableQuantity : 0;
    
    // Status Determination
    const rawStatus = (equipment.status || "").toUpperCase();
    const isAvailable = availQty > 0 && rawStatus !== "UNAVAILABLE" && rawStatus !== "MAINTENANCE";
    
    let displayStatus = "AVAILABLE";
    let badgeClass = "badge-avail";

    if (rawStatus === "MAINTENANCE") {
        displayStatus = "MAINTENANCE";
        badgeClass = "badge-maint";
    } else if (rawStatus === "IN_USE" || rawStatus === "IN USE") {
        displayStatus = "IN USE";
        badgeClass = "badge-inuse";
    } else if (!isAvailable) {
        displayStatus = "UNAVAILABLE";
        badgeClass = "badge-unavail";
    }

    const imgSrc = getImageUrl(equipment.image || equipment.imageUrl, name, category);
    const docUrl = getDocumentUrl(equipment.documentUrl, name, category);

    const handleBookNow = () => {
        navigate("/booking", {
            state: {
                equipmentId: id,
                equipmentName: name
            }
        });
    };

    const handleViewDetails = () => {
        navigate(`/equipment/${id}`);
    };

    return (
        <div className="equipment-card">
            {/* Equipment Image Section */}
            <div className="equipment-image-box">
                <img
                    src={imgSrc}
                    alt={name}
                    className="equipment-card-img"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getFallbackImage(name, category);
                    }}
                />
                <span className={`status-badge ${badgeClass}`}>
                    {displayStatus}
                </span>
            </div>

            {/* Equipment Content Section */}
            <div className="equipment-content">
                <h3 className="equipment-title" title={name}>{name}</h3>
                
                <p className="category-pill">
                    <FaLayerGroup style={{ marginRight: "6px", color: "#2563eb" }} />
                    {category}
                </p>

                <div className="equip-specs">
                    <span>Total Qty: <strong>{totalQty}</strong></span>
                    <span>Available: <strong>{availQty} / {totalQty}</strong></span>
                </div>

                {/* Primary Actions */}
                <div className="card-actions">
                    <button
                        className="details-btn"
                        onClick={handleViewDetails}
                        title="View specifications and details"
                    >
                        <FaInfoCircle /> Details
                    </button>

                    <button
                        className="book-now-btn"
                        onClick={handleBookNow}
                        disabled={!isAvailable}
                        title={isAvailable ? "Book equipment slot" : "Equipment unavailable for booking"}
                    >
                        <FaBookmark /> Book Now
                    </button>
                </div>

                {/* Manual Document Link Button */}
                <div style={{ marginTop: "10px" }}>
                    <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="manual-btn"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "8px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            color: "#0f172a",
                            border: "1px solid #e2e8f0",
                            textDecoration: "none",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "all 0.2s ease"
                        }}
                    >
                        <FaFilePdf style={{ color: "#ef4444" }} /> View User Manual PDF
                    </a>
                </div>

                {/* Admin Management Actions */}
                {showAdminActions && (
                    <div className="admin-card-actions" style={{ display: "flex", gap: "8px", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(id)}
                                style={{
                                    flex: 1,
                                    background: "#f59e0b",
                                    color: "white",
                                    border: "none",
                                    padding: "6px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px"
                                }}
                            >
                                <FaEdit /> Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={() => onDelete(id)}
                                style={{
                                    flex: 1,
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    padding: "6px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "4px"
                                }}
                            >
                                <FaTrash /> Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EquipmentCard;
