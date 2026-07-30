import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function LabTechnicianDashboard() {

    // ===========================
    // Navigation
    // ===========================

    const [activePage, setActivePage] = useState("dashboard");

    // ===========================
    // Dashboard
    // ===========================

    const [dashboard, setDashboard] = useState({
        totalEquipment: 0,
        totalBookings: 0,
        totalLaboratories: 0
    });

    // ===========================
    // Equipment
    // ===========================

    const [equipmentList, setEquipmentList] = useState([]);

    const [equipmentName, setEquipmentName] = useState("");
    const [equipmentCode, setEquipmentCode] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [modelNumber, setModelNumber] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [documentation, setDocumentation] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [calibrationDate, setCalibrationDate] = useState("");
    const [certificationDate, setCertificationDate] = useState("");
    const [status, setStatus] = useState("");
    const [availability, setAvailability] = useState("");
    const [location, setLocation] = useState("");

    const [laboratories, setLaboratories] = useState([]);
    const [selectedLaboratoryId, setSelectedLaboratoryId] = useState("");

    const [editingEquipmentId, setEditingEquipmentId] = useState(null);

    // ===========================
    // Bookings
    // ===========================

    const [bookingList, setBookingList] = useState([]);

    // ===========================
    // Maintenance
    // ===========================

    const [maintenanceEquipmentId, setMaintenanceEquipmentId] = useState("");
    const [maintenanceStatus, setMaintenanceStatus] = useState("");

    // ===========================
    // Calibration
    // ===========================

    const [calibrationEquipmentId, setCalibrationEquipmentId] = useState("");
    const [newCalibrationDate, setNewCalibrationDate] = useState("");

    // ===========================
    // Certification
    // ===========================

    const [certificationEquipmentId, setCertificationEquipmentId] = useState("");
    const [newCertificationDate, setNewCertificationDate] = useState("");

    // ===========================
    // Status Update
    // ===========================

    const [statusEquipmentId, setStatusEquipmentId] = useState("");
    const [newStatus, setNewStatus] = useState("");

    // ===========================
    // Dashboard API
    // ===========================

    const fetchDashboard = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/dashboard"
            );

            setDashboard({
                totalEquipment: response.data.totalEquipment,
                totalBookings: response.data.totalBookings,
                totalLaboratories: response.data.totalLaboratories
            });

        } catch (error) {
            console.error(error);
        }

    };

    // ===========================
    // Laboratory API
    // ===========================

    const fetchLaboratories = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/laboratories"
            );

            setLaboratories(response.data);

        } catch (error) {
            console.error(error);
        }

    };

    // ===========================
    // Equipment API
    // ===========================

    const fetchEquipment = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/equipment"
            );

            setEquipmentList(response.data);

        } catch (error) {
            console.error(error);
        }

    };

    // ===========================
    // Booking API
    // ===========================

    const fetchBookings = async () => {

        try {

            const response = await axios.get(
                "http://localhost:8080/api/bookings"
            );

            setBookingList(response.data);

        } catch (error) {
            console.error(error);
        }

    };

    const updateBookingStatus = async (booking, statusValue) => {

        const body = {
            bookedBy: booking.bookedBy,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            status: statusValue,
            equipment: booking.equipment
        };

        try {
            await axios.put(
                `http://localhost:8080/api/bookings/${booking.id}`,
                body
            );

            fetchBookings();
        } catch (error) {
            console.error(error);
        }

    };

    // ===========================
    // Load Data
    // ===========================

    useEffect(() => {

        fetchDashboard();
        fetchLaboratories();
        fetchEquipment();
        fetchBookings();

    }, []);

    // ===========================
    // Save Equipment
    // ===========================

    const saveEquipment = async () => {

        if (
            equipmentName.trim() === "" ||
            equipmentCode.trim() === "" ||
            selectedLaboratoryId === ""
        ) {
            alert("Please fill all required fields.");
            return;
        }

        try {

            const equipment = {
                equipmentName,
                equipmentCode,
                manufacturer,
                modelNumber,
                description,
                imageUrl,
                documentation,
                purchaseDate,
                calibrationDate,
                certificationDate,
                status,
                availability,
                location,
                laboratory: {
                    id: selectedLaboratoryId
                }
            };

            if (editingEquipmentId === null) {

                await axios.post(
                    "http://localhost:8080/api/equipment",
                    equipment
                );

                alert("Equipment Added Successfully");

            } else {

                await axios.put(
                    `http://localhost:8080/api/equipment/${editingEquipmentId}`,
                    equipment
                );

                alert("Equipment Updated Successfully");

                setEditingEquipmentId(null);
            }

            setEquipmentName("");
            setEquipmentCode("");
            setManufacturer("");
            setModelNumber("");
            setDescription("");
            setImageUrl("");
            setDocumentation("");
            setPurchaseDate("");
            setCalibrationDate("");
            setCertificationDate("");
            setStatus("");
            setAvailability("");
            setLocation("");
            setSelectedLaboratoryId("");

            fetchEquipment();
            fetchDashboard();

        } catch (error) {

            console.error(error);
            alert("Operation Failed");

        }

    };

    // ===========================
    // Edit Equipment
    // ===========================

    const editEquipment = (equipment) => {

        setEditingEquipmentId(equipment.id);

        setEquipmentName(equipment.equipmentName || "");
        setEquipmentCode(equipment.equipmentCode || "");
        setManufacturer(equipment.manufacturer || "");
        setModelNumber(equipment.modelNumber || "");
        setDescription(equipment.description || "");
        setImageUrl(equipment.imageUrl || "");
        setDocumentation(equipment.documentation || "");
        setPurchaseDate(equipment.purchaseDate || "");
        setCalibrationDate(equipment.calibrationDate || "");
        setCertificationDate(equipment.certificationDate || "");
        setStatus(equipment.status || "");
        setAvailability(equipment.availability || "");
        setLocation(equipment.location || "");

        if (equipment.laboratory) {
            setSelectedLaboratoryId(equipment.laboratory.id);
        } else {
            setSelectedLaboratoryId("");
        }

    };

    // ===========================
    // Delete Equipment
    // ===========================

    const deleteEquipment = async (id) => {

        if (!window.confirm("Delete this equipment?")) {
            return;
        }

        try {

            await axios.delete(
                `http://localhost:8080/api/equipment/${id}`
            );

            alert("Equipment Deleted Successfully");

            fetchEquipment();
            fetchDashboard();

        } catch (error) {

            console.error(error);
            alert("Delete Failed");

        }

    };

    // ===========================
    // Update Maintenance
    // ===========================

    const updateMaintenance = async () => {

        if (
            maintenanceEquipmentId === "" ||
            maintenanceStatus.trim() === ""
        ) {
            alert("Please select equipment and maintenance status.");
            return;
        }

        try {

            const equipment = equipmentList.find(
                (e) => e.id === Number(maintenanceEquipmentId)
            );

            if (!equipment) {
                alert("Equipment not found.");
                return;
            }

            const body = {
                ...equipment,
                status: maintenanceStatus,
                laboratory: {
                    id: equipment.laboratory.id
                }
            };

            await axios.put(
                `http://localhost:8080/api/equipment/${maintenanceEquipmentId}`,
                body
            );

            alert("Maintenance Status Updated Successfully");

            setMaintenanceEquipmentId("");
            setMaintenanceStatus("");

            fetchEquipment();

        } catch (error) {

            console.error(error);
            alert("Update Failed");

        }

    };

    // ===========================
    // Update Calibration
    // ===========================

    const updateCalibration = async () => {

        if (
            calibrationEquipmentId === "" ||
            newCalibrationDate === ""
        ) {
            alert("Please select equipment and calibration date.");
            return;
        }

        try {

            const equipment = equipmentList.find(
                (e) => e.id === Number(calibrationEquipmentId)
            );

            if (!equipment) {
                alert("Equipment not found.");
                return;
            }

            const body = {
                ...equipment,
                calibrationDate: newCalibrationDate,
                laboratory: {
                    id: equipment.laboratory.id
                }
            };

            await axios.put(
                `http://localhost:8080/api/equipment/${calibrationEquipmentId}`,
                body
            );

            alert("Calibration Date Updated Successfully");

            setCalibrationEquipmentId("");
            setNewCalibrationDate("");

            fetchEquipment();

        } catch (error) {

            console.error(error);
            alert("Update Failed");

        }

    };

    // ===========================
    // Update Certification
    // ===========================

    const updateCertification = async () => {

        if (
            certificationEquipmentId === "" ||
            newCertificationDate === ""
        ) {
            alert("Please select equipment and certification date.");
            return;
        }

        try {

            const equipment = equipmentList.find(
                (e) => e.id === Number(certificationEquipmentId)
            );

            if (!equipment) {
                alert("Equipment not found.");
                return;
            }

            const body = {
                ...equipment,
                certificationDate: newCertificationDate,
                laboratory: {
                    id: equipment.laboratory.id
                }
            };

            await axios.put(
                `http://localhost:8080/api/equipment/${certificationEquipmentId}`,
                body
            );

            alert("Certification Date Updated Successfully");

            setCertificationEquipmentId("");
            setNewCertificationDate("");

            fetchEquipment();

        } catch (error) {

            console.error(error);
            alert("Update Failed");

        }

    };

    // ===========================
    // Update Equipment Status
    // ===========================

    const updateStatus = async () => {

        if (
            statusEquipmentId === "" ||
            newStatus.trim() === ""
        ) {
            alert("Please select equipment and status.");
            return;
        }

        try {

            const equipment = equipmentList.find(
                (e) => e.id === Number(statusEquipmentId)
            );

            if (!equipment) {
                alert("Equipment not found.");
                return;
            }

            const body = {
                ...equipment,
                status: newStatus,
                laboratory: {
                    id: equipment.laboratory.id
                }
            };

            await axios.put(
                `http://localhost:8080/api/equipment/${statusEquipmentId}`,
                body
            );

            alert("Equipment Status Updated Successfully");

            setStatusEquipmentId("");
            setNewStatus("");

            fetchEquipment();

        } catch (error) {

            console.error(error);
            alert("Update Failed");

        }

    };

    // ===========================
    // Styling
    // ===========================

    const styles = {
        container: {
            display: "flex",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#334155"
        },
        sidebar: {
            width: "260px",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
            boxShadow: "4px 0 10px rgba(0, 0, 0, 0.05)"
        },
        sidebarHeader: {
            padding: "24px 20px",
            borderBottom: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        sidebarTitle: {
            fontSize: "18px",
            fontWeight: "700",
            letterSpacing: "0.5px",
            color: "#ffffff",
            margin: 0
        },
        sidebarSubtitle: {
            fontSize: "11px",
            color: "#94a3b8",
            margin: "2px 0 0 0",
            textTransform: "uppercase",
            letterSpacing: "1px"
        },
        navList: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "20px 12px",
            flex: 1
        },
        navButton: (isActive) => ({
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isActive ? "#2563eb" : "transparent",
            color: isActive ? "#ffffff" : "#94a3b8",
            fontSize: "14px",
            fontWeight: isActive ? "600" : "500",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.2s ease",
            outline: "none"
        }),
        logoutButton: {
            margin: "auto 12px 20px 12px",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #334155",
            backgroundColor: "transparent",
            color: "#ef4444",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
        },
        mainContent: {
            marginLeft: "260px",
            flex: 1,
            padding: "32px",
            maxWidth: "calc(100vw - 260px)",
            boxSizing: "border-box"
        },
        headerArea: {
            marginBottom: "28px"
        },
        pageTitle: {
            fontSize: "26px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 6px 0"
        },
        pageSubtitle: {
            fontSize: "14px",
            color: "#64748b",
            margin: 0
        },
        card: {
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
            border: "1px solid #e2e8f0",
            marginBottom: "24px"
        },
        cardTitle: {
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        sectionHeading: {
            fontSize: "14px",
            fontWeight: "600",
            color: "#2563eb",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            gridColumn: "1 / -1",
            marginTop: "10px",
            marginBottom: "4px",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "6px"
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "20px"
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column",
            gap: "6px"
        },
        label: {
            fontSize: "13px",
            fontWeight: "500",
            color: "#475569"
        },
        input: {
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s ease",
            backgroundColor: "#ffffff",
            color: "#1e293b"
        },
        select: {
            padding: "10px 14px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#ffffff",
            color: "#1e293b",
            cursor: "pointer"
        },
        primaryButton: {
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            alignSelf: "flex-start"
        },
        tableContainer: {
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #e2e8f0"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            fontSize: "14px"
        },
        th: {
            backgroundColor: "#f1f5f9",
            padding: "12px 16px",
            fontWeight: "600",
            color: "#475569",
            borderBottom: "1px solid #e2e8f0"
        },
        td: {
            padding: "14px 16px",
            borderBottom: "1px solid #f1f5f9",
            color: "#334155"
        },
        actionButtonEdit: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #cbd5e1",
            backgroundColor: "#ffffff",
            color: "#2563eb",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            marginRight: "8px"
        },
        actionButtonDelete: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            color: "#ef4444",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer"
        },
        actionButtonApprove: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #a7f3d0",
            backgroundColor: "#ecfdf5",
            color: "#059669",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            marginRight: "8px"
        },
        actionButtonReject: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer"
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px"
        },
        statCard: (borderColor) => ({
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e2e8f0",
            borderLeft: `4px solid ${borderColor}`,
            display: "flex",
            flexDirection: "column"
        }),
        statTitle: {
            fontSize: "13px",
            fontWeight: "600",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "8px"
        },
        statValue: {
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f172a"
        }
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard" },
        { id: "equipment", label: "Equipment" },
        { id: "bookings", label: "Bookings" },
        { id: "maintenance", label: "Maintenance" }
    ];

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div>
                        <h2 style={styles.sidebarTitle}>Lab Technician</h2>
                        <p style={styles.sidebarSubtitle}>Lab Resource Management System</p>
                    </div>
                </div>

                <div style={styles.navList}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            style={styles.navButton(activePage === item.id)}
                            onClick={() => setActivePage(item.id)}
                            onMouseEnter={(e) => {
                                if (activePage !== item.id) {
                                    e.currentTarget.style.backgroundColor = "#1e293b";
                                    e.currentTarget.style.color = "#ffffff";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activePage !== item.id) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "#94a3b8";
                                }
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    style={styles.logoutButton}
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.reload();
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef4444";
                        e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#ef4444";
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* DASHBOARD PAGE */}
                {activePage === "dashboard" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Dashboard Overview</h1>
                            <p style={styles.pageSubtitle}>Technician dashboard metrics and resource overview</p>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#8b5cf6")}>
                                <span style={styles.statTitle}>Total Equipment</span>
                                <span style={styles.statValue}>{dashboard.totalEquipment}</span>
                            </div>

                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Total Laboratories</span>
                                <span style={styles.statValue}>{dashboard.totalLaboratories}</span>
                            </div>

                            <div style={styles.statCard("#ec4899")}>
                                <span style={styles.statTitle}>Total Bookings</span>
                                <span style={styles.statValue}>{dashboard.totalBookings}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* EQUIPMENT PAGE */}
                {activePage === "equipment" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Equipment Management</h1>
                            <p style={styles.pageSubtitle}>Manage and edit laboratory equipment details</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingEquipmentId === null ? "Add Equipment" : "Update Equipment"}
                            </h3>

                            <div style={styles.formGrid}>
                                <div style={styles.sectionHeading}>General Information</div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Equipment Name</label>
                                    <input
                                        type="text"
                                        placeholder="Equipment Name"
                                        value={equipmentName}
                                        onChange={(e) => setEquipmentName(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Equipment Code</label>
                                    <input
                                        type="text"
                                        placeholder="Equipment Code"
                                        value={equipmentCode}
                                        onChange={(e) => setEquipmentCode(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Manufacturer</label>
                                    <input
                                        type="text"
                                        placeholder="Manufacturer"
                                        value={manufacturer}
                                        onChange={(e) => setManufacturer(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Model Number</label>
                                    <input
                                        type="text"
                                        placeholder="Model Number"
                                        value={modelNumber}
                                        onChange={(e) => setModelNumber(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Description</label>
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.sectionHeading}>Dates</div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Purchase Date</label>
                                    <input
                                        type="date"
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Calibration Date</label>
                                    <input
                                        type="date"
                                        value={calibrationDate}
                                        onChange={(e) => setCalibrationDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Certification Date</label>
                                    <input
                                        type="date"
                                        value={certificationDate}
                                        onChange={(e) => setCertificationDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.sectionHeading}>Additional Information</div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Image URL</label>
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Documentation</label>
                                    <input
                                        type="text"
                                        placeholder="Documentation"
                                        value={documentation}
                                        onChange={(e) => setDocumentation(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Status</label>
                                    <input
                                        type="text"
                                        placeholder="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Availability</label>
                                    <input
                                        type="text"
                                        placeholder="Availability"
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Location</label>
                                    <input
                                        type="text"
                                        placeholder="Location"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Laboratory</label>
                                    <select
                                        value={selectedLaboratoryId}
                                        onChange={(e) => setSelectedLaboratoryId(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">Select Laboratory</option>
                                        {laboratories.map((lab) => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.labName || lab.laboratoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button onClick={saveEquipment} style={styles.primaryButton}>
                                {editingEquipmentId === null ? "Add Equipment" : "Update Equipment"}
                            </button>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Equipment List</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Code</th>
                                        <th style={styles.th}>Manufacturer</th>
                                        <th style={styles.th}>Model</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Availability</th>
                                        <th style={styles.th}>Calibration</th>
                                        <th style={styles.th}>Certification</th>
                                        <th style={styles.th}>Location</th>
                                        <th style={styles.th}>Laboratory</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {equipmentList.length > 0 ? (
                                        equipmentList.map((equipment) => (
                                            <tr key={equipment.id}>
                                                <td style={styles.td}>{equipment.id}</td>
                                                <td style={styles.td}>{equipment.equipmentName}</td>
                                                <td style={styles.td}>{equipment.equipmentCode}</td>
                                                <td style={styles.td}>{equipment.manufacturer}</td>
                                                <td style={styles.td}>{equipment.modelNumber}</td>
                                                <td style={styles.td}>{equipment.status}</td>
                                                <td style={styles.td}>{equipment.availability}</td>
                                                <td style={styles.td}>{equipment.calibrationDate}</td>
                                                <td style={styles.td}>{equipment.certificationDate}</td>
                                                <td style={styles.td}>{equipment.location}</td>
                                                <td style={styles.td}>
                                                    {equipment.laboratory
                                                        ? (equipment.laboratory.labName || equipment.laboratory.laboratoryName)
                                                        : ""}
                                                </td>
                                                <td style={{ ...styles.td, textAlign: "right" }}>
                                                    <button
                                                        onClick={() => editEquipment(equipment)}
                                                        style={styles.actionButtonEdit}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEquipment(equipment.id)}
                                                        style={styles.actionButtonDelete}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="12" style={styles.td}>
                                                No Equipment Available
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKINGS PAGE */}
                {activePage === "bookings" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Bookings</h1>
                            <p style={styles.pageSubtitle}>Review and manage equipment booking requests</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Booking Requests</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Booked By</th>
                                        <th style={styles.th}>Equipment</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Start</th>
                                        <th style={styles.th}>End</th>
                                        <th style={styles.th}>Purpose</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bookingList.map((booking) => (
                                        <tr key={booking.id}>
                                            <td style={styles.td}>{booking.id}</td>
                                            <td style={styles.td}>{booking.bookedBy}</td>
                                            <td style={styles.td}>{booking.equipment?.equipmentName}</td>
                                            <td style={styles.td}>{booking.bookingDate}</td>
                                            <td style={styles.td}>{booking.startTime}</td>
                                            <td style={styles.td}>{booking.endTime}</td>
                                            <td style={styles.td}>{booking.purpose}</td>
                                            <td style={styles.td}>{booking.status}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => updateBookingStatus(booking, "Approved")}
                                                    style={styles.actionButtonApprove}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateBookingStatus(booking, "Rejected")}
                                                    style={styles.actionButtonReject}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAINTENANCE PAGE */}
                {activePage === "maintenance" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Maintenance</h1>
                            <p style={styles.pageSubtitle}>Update maintenance, calibration, certification, and equipment status</p>
                        </div>

                        {/* Maintenance Status Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Maintenance Status</h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap", alignItems: "center" }}>
                                <select
                                    value={maintenanceEquipmentId}
                                    onChange={(e) => setMaintenanceEquipmentId(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map((equipment) => (
                                        <option key={equipment.id} value={equipment.id}>
                                            {equipment.equipmentName}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={maintenanceStatus}
                                    onChange={(e) => setMaintenanceStatus(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Operational">Operational</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Repair Required">Repair Required</option>
                                    <option value="Out of Service">Out of Service</option>
                                </select>

                                <button onClick={updateMaintenance} style={styles.primaryButton}>
                                    Update Maintenance
                                </button>
                            </div>
                        </div>

                        {/* Calibration Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Calibration</h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap", alignItems: "center" }}>
                                <select
                                    value={calibrationEquipmentId}
                                    onChange={(e) => setCalibrationEquipmentId(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map((equipment) => (
                                        <option key={equipment.id} value={equipment.id}>
                                            {equipment.equipmentName}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="date"
                                    value={newCalibrationDate}
                                    onChange={(e) => setNewCalibrationDate(e.target.value)}
                                    style={{ ...styles.input, flex: "1 1 200px" }}
                                />

                                <button onClick={updateCalibration} style={styles.primaryButton}>
                                    Update Calibration
                                </button>
                            </div>
                        </div>

                        {/* Certification Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Certification</h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap", alignItems: "center" }}>
                                <select
                                    value={certificationEquipmentId}
                                    onChange={(e) => setCertificationEquipmentId(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map((equipment) => (
                                        <option key={equipment.id} value={equipment.id}>
                                            {equipment.equipmentName}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="date"
                                    value={newCertificationDate}
                                    onChange={(e) => setNewCertificationDate(e.target.value)}
                                    style={{ ...styles.input, flex: "1 1 200px" }}
                                />

                                <button onClick={updateCertification} style={styles.primaryButton}>
                                    Update Certification
                                </button>
                            </div>
                        </div>

                        {/* Status Update Section */}
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Status Update</h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap", alignItems: "center" }}>
                                <select
                                    value={statusEquipmentId}
                                    onChange={(e) => setStatusEquipmentId(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map((equipment) => (
                                        <option key={equipment.id} value={equipment.id}>
                                            {equipment.equipmentName}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Available">Available</option>
                                    <option value="In Use">In Use</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Out of Service">Out of Service</option>
                                </select>

                                <button onClick={updateStatus} style={styles.primaryButton}>
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LabTechnicianDashboard;