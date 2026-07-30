import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const token = localStorage.getItem("token");
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function DepartmentHeadDashboard() {

    // Dashboard
    const [dashboard, setDashboard] = useState({
        totalLaboratories: 0,
        totalEquipment: 0,
        totalBookings: 0
    });

    // Departments
    const [departments, setDepartments] = useState([]);

    // Laboratories
    const [laboratories, setLaboratories] = useState([]);
    const [laboratoryName, setLaboratoryName] = useState("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
    const [editingLaboratoryId, setEditingLaboratoryId] = useState(null);

    // Equipment
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
    const [selectedLaboratoryId, setSelectedLaboratoryId] = useState("");
    const [editingEquipmentId, setEditingEquipmentId] = useState(null);

    // Bookings
    const [bookingList, setBookingList] = useState([]);

    const [activePage, setActivePage] = useState("dashboard");

    // Users
    useEffect(() => {
        fetchDashboard();
        fetchDepartments();
        fetchLaboratories();
        fetchEquipment();
        fetchBookings();
    }, []);

    const fetchDashboard = async () => {
        const res = await axios.get("http://localhost:8080/api/dashboard");
        setDashboard(res.data);
    };

    const fetchDepartments = async () => {
        const res = await axios.get("http://localhost:8080/api/departments");
        setDepartments(res.data);
    };

    const fetchLaboratories = async () => {
        const res = await axios.get("http://localhost:8080/api/laboratories");
        setLaboratories(res.data);
    };

    const fetchEquipment = async () => {
        const res = await axios.get("http://localhost:8080/api/equipment");
        setEquipmentList(res.data);
    };

    const fetchBookings = async () => {
        const res = await axios.get("http://localhost:8080/api/bookings");
        setBookingList(res.data);
    };


    const saveLaboratory = async () => {

        const body = {
            laboratoryName,
            department: { id: selectedDepartmentId }
        };

        if (editingLaboratoryId) {
            await axios.put(
                `http://localhost:8080/api/laboratories/${editingLaboratoryId}`,
                body
            );
        } else {
            await axios.post(
                "http://localhost:8080/api/laboratories",
                body
            );
        }

        setLaboratoryName("");
        setSelectedDepartmentId("");
        setEditingLaboratoryId(null);
        fetchLaboratories();
    };

    const editLaboratory = (lab) => {
        setEditingLaboratoryId(lab.id);
        setLaboratoryName(lab.laboratoryName);
        setSelectedDepartmentId(lab.department?.id || "");
    };

    const deleteLaboratory = async (id) => {
        await axios.delete(`http://localhost:8080/api/laboratories/${id}`);
        fetchLaboratories();
    };

    const saveEquipment = async () => {

        const body = {
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

        if (editingEquipmentId) {
            await axios.put(
                `http://localhost:8080/api/equipment/${editingEquipmentId}`,
                body
            );
        } else {
            await axios.post(
                "http://localhost:8080/api/equipment",
                body
            );
        }

        fetchEquipment();
    };

    const editEquipment = (eq) => {

        setEditingEquipmentId(eq.id);
        setEquipmentName(eq.equipmentName);
        setEquipmentCode(eq.equipmentCode);
        setManufacturer(eq.manufacturer);
        setModelNumber(eq.modelNumber);
        setDescription(eq.description);
        setImageUrl(eq.imageUrl);
        setDocumentation(eq.documentation);
        setPurchaseDate(eq.purchaseDate);
        setCalibrationDate(eq.calibrationDate);
        setCertificationDate(eq.certificationDate);
        setStatus(eq.status);
        setAvailability(eq.availability);
        setLocation(eq.location);
        setSelectedLaboratoryId(eq.laboratory?.id || "");
    };

    const deleteEquipment = async (id) => {
        await axios.delete(`http://localhost:8080/api/equipment/${id}`);
        fetchEquipment();
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

        await axios.put(
            `http://localhost:8080/api/bookings/${booking.id}`,
            body
        );

        fetchBookings();
    };

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
        { id: "laboratories", label: "Laboratories" },
        { id: "equipment", label: "Equipment" },
        { id: "bookings", label: "Bookings" }
    ];

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <div>
                        <h2 style={styles.sidebarTitle}>Department Head</h2>
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
                        localStorage.removeItem("role");
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
                            <p style={styles.pageSubtitle}>Department statistics and laboratory resources overview</p>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Total Laboratories</span>
                                <span style={styles.statValue}>{dashboard.totalLaboratories}</span>
                            </div>

                            <div style={styles.statCard("#8b5cf6")}>
                                <span style={styles.statTitle}>Total Equipment</span>
                                <span style={styles.statValue}>{dashboard.totalEquipment}</span>
                            </div>

                            <div style={styles.statCard("#ec4899")}>
                                <span style={styles.statTitle}>Total Bookings</span>
                                <span style={styles.statValue}>{dashboard.totalBookings}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* LABORATORIES PAGE */}
                {activePage === "laboratories" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Laboratories</h1>
                            <p style={styles.pageSubtitle}>Manage department laboratory facilities</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingLaboratoryId ? "Edit Laboratory" : "Add New Laboratory"}
                            </h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap" }}>
                                <input
                                    type="text"
                                    placeholder="Laboratory Name"
                                    value={laboratoryName}
                                    onChange={(e) => setLaboratoryName(e.target.value)}
                                    style={{ ...styles.input, flex: "1 1 200px" }}
                                />
                                <select
                                    value={selectedDepartmentId}
                                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                                    style={{ ...styles.select, flex: "1 1 200px" }}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.departmentName}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={saveLaboratory} style={styles.primaryButton}>
                                    {editingLaboratoryId ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Laboratories List</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Laboratory</th>
                                        <th style={styles.th}>Department</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {laboratories.map((lab) => (
                                        <tr key={lab.id}>
                                            <td style={styles.td}>{lab.id}</td>
                                            <td style={styles.td}>{lab.laboratoryName}</td>
                                            <td style={styles.td}>{lab.department?.departmentName}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => editLaboratory(lab)}
                                                    style={styles.actionButtonEdit}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteLaboratory(lab.id)}
                                                    style={styles.actionButtonDelete}
                                                >
                                                    Delete
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

                {/* EQUIPMENT PAGE */}
                {activePage === "equipment" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Equipment</h1>
                            <p style={styles.pageSubtitle}>Manage laboratory equipment, dates, and availability</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingEquipmentId ? "Edit Equipment" : "Add New Equipment"}
                            </h3>

                            <div style={styles.formGrid}>
                                <div style={styles.sectionHeading}>General Information</div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Equipment Name</label>
                                    <input
                                        placeholder="Equipment Name"
                                        value={equipmentName}
                                        onChange={(e) => setEquipmentName(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Equipment Code</label>
                                    <input
                                        placeholder="Equipment Code"
                                        value={equipmentCode}
                                        onChange={(e) => setEquipmentCode(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Manufacturer</label>
                                    <input
                                        placeholder="Manufacturer"
                                        value={manufacturer}
                                        onChange={(e) => setManufacturer(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Model Number</label>
                                    <input
                                        placeholder="Model Number"
                                        value={modelNumber}
                                        onChange={(e) => setModelNumber(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Description</label>
                                    <input
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
                                        placeholder="Image URL"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Documentation</label>
                                    <input
                                        placeholder="Documentation"
                                        value={documentation}
                                        onChange={(e) => setDocumentation(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Status</label>
                                    <input
                                        placeholder="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Availability</label>
                                    <input
                                        placeholder="Availability"
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Location</label>
                                    <input
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
                                                {lab.laboratoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={saveEquipment} style={styles.primaryButton}>
                                {editingEquipmentId ? "Update" : "Add"}
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
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Availability</th>
                                        <th style={styles.th}>Laboratory</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {equipmentList.map((eq) => (
                                        <tr key={eq.id}>
                                            <td style={styles.td}>{eq.id}</td>
                                            <td style={styles.td}>{eq.equipmentName}</td>
                                            <td style={styles.td}>{eq.equipmentCode}</td>
                                            <td style={styles.td}>{eq.status}</td>
                                            <td style={styles.td}>{eq.availability}</td>
                                            <td style={styles.td}>{eq.laboratory?.laboratoryName}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => editEquipment(eq)}
                                                    style={styles.actionButtonEdit}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteEquipment(eq.id)}
                                                    style={styles.actionButtonDelete}
                                                >
                                                    Delete
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
            </div>
        </div>
    );
}

export default DepartmentHeadDashboard;