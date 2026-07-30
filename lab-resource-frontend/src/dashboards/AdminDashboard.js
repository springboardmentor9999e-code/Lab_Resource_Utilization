import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const token = localStorage.getItem("token");

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function AdminDashboard() {

    // ===========================
    // Departments
    // ===========================

    const [departments, setDepartments] = useState([]);
    const [departmentName, setDepartmentName] = useState("");
    const [editingDepartmentId, setEditingDepartmentId] = useState(null);

    // ===========================
    // Institutions
    // ===========================

    const [institutions, setInstitutions] = useState([]);
    const [institutionName, setInstitutionName] = useState("");
    const [editingInstitutionId, setEditingInstitutionId] = useState(null);

    // ===========================
    // Laboratories
    // ===========================

    const [laboratories, setLaboratories] = useState([]);
    const [laboratoryName, setLaboratoryName] = useState("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
    const [editingLaboratoryId, setEditingLaboratoryId] = useState(null);

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

    const [selectedLaboratoryId, setSelectedLaboratoryId] = useState("");
    const [editingEquipmentId, setEditingEquipmentId] = useState(null);

    // ===========================
    // Booking
    // ===========================

    const [bookingList, setBookingList] = useState([]);
    const [bookedBy, setBookedBy] = useState("");
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [bookingStatus, setBookingStatus] = useState("Pending");
    const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
    const [editingBookingId, setEditingBookingId] = useState(null);

    const [dashboard, setDashboard] = useState({
        totalInstitutions: 0,
        totalDepartments: 0,
        totalLaboratories: 0,
        totalEquipment: 0,
        totalBookings: 0
    });
    const [activePage, setActivePage] = useState("dashboard");

    // ===========================
    // Load Data
    // ===========================

    useEffect(() => {
        fetchInstitutions();
        fetchDepartments();
        fetchLaboratories();
        fetchEquipment();
        fetchBookings();
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/dashboard");
            setDashboard(response.data);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    // ===========================
    // Department APIs
    // ===========================

    const fetchDepartments = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/departments"
            );
            setDepartments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const saveDepartment = async () => {
        if (departmentName.trim() === "") return;

        try {
            if (editingDepartmentId === null) {
                await axios.post(
                    "http://localhost:8080/api/departments",
                    {
                        departmentName: departmentName
                    }
                );
            } else {
                await axios.put(
                    `http://localhost:8080/api/departments/${editingDepartmentId}`,
                    {
                        departmentName: departmentName
                    }
                );

                setEditingDepartmentId(null);
            }

            setDepartmentName("");
            fetchDepartments();

        } catch (error) {
            console.error(error);
        }
    };

    const editDepartment = (department) => {
        setDepartmentName(department.departmentName);
        setEditingDepartmentId(department.id);
    };

    const deleteDepartment = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/departments/${id}`
            );

            fetchDepartments();

        } catch (error) {
            console.error(error);
        }
    };

    // ===========================
    // Institution APIs
    // ===========================

    const fetchInstitutions = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/institutions"
            );

            setInstitutions(response.data);

        } catch (error) {
            console.error(error);
        }
    };

    const saveInstitution = async () => {
        if (institutionName.trim() === "") return;

        try {

            if (editingInstitutionId === null) {

                await axios.post(
                    "http://localhost:8080/api/institutions",
                    {
                        institutionName: institutionName
                    }
                );

            } else {

                await axios.put(
                    `http://localhost:8080/api/institutions/${editingInstitutionId}`,
                    {
                        institutionName: institutionName
                    }
                );

                setEditingInstitutionId(null);
            }

            setInstitutionName("");
            fetchInstitutions();

        } catch (error) {
            console.error(error);
        }
    };

    const editInstitution = (institution) => {
        setInstitutionName(institution.institutionName);
        setEditingInstitutionId(institution.id);
    };

    const deleteInstitution = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/institutions/${id}`
            );

            fetchInstitutions();

        } catch (error) {
            console.error(error);
        }
    };

    // ===========================
    // Laboratory APIs
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

    const saveLaboratory = async () => {

        if (
            laboratoryName.trim() === "" ||
            selectedDepartmentId === ""
        )
            return;

        try {

            const body = {
                laboratoryName: laboratoryName,
                department: {
                    id: selectedDepartmentId
                }
            };

            if (editingLaboratoryId === null) {

                await axios.post(
                    "http://localhost:8080/api/laboratories",
                    body
                );

            } else {

                await axios.put(
                    `http://localhost:8080/api/laboratories/${editingLaboratoryId}`,
                    body
                );

                setEditingLaboratoryId(null);
            }

            setLaboratoryName("");
            setSelectedDepartmentId("");

            fetchLaboratories();

        } catch (error) {
            console.error(error);
        }
    };

    const editLaboratory = (lab) => {

        setLaboratoryName(lab.laboratoryName);

        if (lab.department) {
            setSelectedDepartmentId(lab.department.id);
        }

        setEditingLaboratoryId(lab.id);
    };

    const deleteLaboratory = async (id) => {

        try {

            await axios.delete(
                `http://localhost:8080/api/laboratories/${id}`
            );

            fetchLaboratories();

        } catch (error) {
            console.error(error);
        }
    };

    // ===========================
    // Equipment APIs
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

    const fetchBookings = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/bookings");
            setBookingList(response.data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const saveEquipment = async () => {

        if (
            equipmentName.trim() === "" ||
            equipmentCode.trim() === "" ||
            selectedLaboratoryId === ""
        ) {
            return;
        }

        try {

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

            if (editingEquipmentId === null) {

                await axios.post(
                    "http://localhost:8080/api/equipment",
                    body
                );

            } else {

                await axios.put(
                    `http://localhost:8080/api/equipment/${editingEquipmentId}`,
                    body
                );

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

        } catch (error) {
            console.error(error);
        }
    };

    const saveBooking = async () => {
        try {
            const booking = {
                bookedBy,
                bookingDate,
                startTime,
                endTime,
                purpose,
                status: bookingStatus,
                equipment: {
                    id: selectedEquipmentId
                }
            };

            if (editingBookingId) {
                await axios.put(
                    `http://localhost:8080/api/bookings/${editingBookingId}`,
                    booking
                );
            } else {
                await axios.post(
                    "http://localhost:8080/api/bookings",
                    booking
                );
            }

            fetchBookings();

            setBookedBy("");
            setBookingDate("");
            setStartTime("");
            setEndTime("");
            setPurpose("");
            setBookingStatus("Pending");
            setSelectedEquipmentId("");
            setEditingBookingId(null);

        } catch (error) {
            console.error("Error saving booking:", error);
        }
    };

    const editEquipment = (equipment) => {

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
        }

        setEditingEquipmentId(equipment.id);
    };

    const deleteEquipment = async (id) => {

        try {

            await axios.delete(
                `http://localhost:8080/api/equipment/${id}`
            );

            fetchEquipment();

        } catch (error) {
            console.error(error);
        }
    };

    const editBooking = (booking) => {
        setEditingBookingId(booking.id);
        setBookedBy(booking.bookedBy);
        setBookingDate(booking.bookingDate);
        setStartTime(booking.startTime);
        setEndTime(booking.endTime);
        setPurpose(booking.purpose);
        setBookingStatus(booking.status);
        setSelectedEquipmentId(booking.equipment?.id || "");
    };

    const deleteBooking = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/bookings/${id}`);
            fetchBookings();
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    // ===========================
    // UI Styling & Render
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
        { id: "institutions", label: "Institutions" },
        { id: "departments", label: "Departments" },
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
                        <h2 style={styles.sidebarTitle}>Lab Resource</h2>
                        <p style={styles.sidebarSubtitle}>Management System</p>
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
                            <p style={styles.pageSubtitle}>System metrics and resource summaries</p>
                        </div>

                        <div style={styles.statsGrid}>
                            <div style={styles.statCard("#3b82f6")}>
                                <span style={styles.statTitle}>Institutions</span>
                                <span style={styles.statValue}>{dashboard.totalInstitutions}</span>
                            </div>

                            <div style={styles.statCard("#10b981")}>
                                <span style={styles.statTitle}>Departments</span>
                                <span style={styles.statValue}>{dashboard.totalDepartments}</span>
                            </div>

                            <div style={styles.statCard("#f59e0b")}>
                                <span style={styles.statTitle}>Laboratories</span>
                                <span style={styles.statValue}>{dashboard.totalLaboratories}</span>
                            </div>

                            <div style={styles.statCard("#8b5cf6")}>
                                <span style={styles.statTitle}>Equipment</span>
                                <span style={styles.statValue}>{dashboard.totalEquipment}</span>
                            </div>

                            <div style={styles.statCard("#ec4899")}>
                                <span style={styles.statTitle}>Bookings</span>
                                <span style={styles.statValue}>{dashboard.totalBookings}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* INSTITUTIONS PAGE */}
                {activePage === "institutions" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Institutions</h1>
                            <p style={styles.pageSubtitle}>Manage affiliated institutions and organizations</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingInstitutionId ? "Edit Institution" : "Add New Institution"}
                            </h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "500px" }}>
                                <input
                                    type="text"
                                    placeholder="Institution Name"
                                    value={institutionName}
                                    onChange={(e) => setInstitutionName(e.target.value)}
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button onClick={saveInstitution} style={styles.primaryButton}>
                                    {editingInstitutionId ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Institutions List</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Name</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {institutions.map((institution) => (
                                        <tr key={institution.id}>
                                            <td style={styles.td}>{institution.id}</td>
                                            <td style={styles.td}>{institution.institutionName}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => editInstitution(institution)}
                                                    style={styles.actionButtonEdit}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteInstitution(institution.id)}
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

                {/* DEPARTMENTS PAGE */}
                {activePage === "departments" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Departments</h1>
                            <p style={styles.pageSubtitle}>Manage academic and research departments</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingDepartmentId ? "Edit Department" : "Add New Department"}
                            </h3>
                            <div style={{ display: "flex", gap: "12px", maxWidth: "500px" }}>
                                <input
                                    type="text"
                                    placeholder="Department Name"
                                    value={departmentName}
                                    onChange={(e) => setDepartmentName(e.target.value)}
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button onClick={saveDepartment} style={styles.primaryButton}>
                                    {editingDepartmentId ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Departments List</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Name</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {departments.map((department) => (
                                        <tr key={department.id}>
                                            <td style={styles.td}>{department.id}</td>
                                            <td style={styles.td}>{department.departmentName}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => editDepartment(department)}
                                                    style={styles.actionButtonEdit}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteDepartment(department.id)}
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

                {/* LABORATORIES PAGE */}
                {activePage === "laboratories" && (
                    <div>
                        <div style={styles.headerArea}>
                            <h1 style={styles.pageTitle}>Laboratories</h1>
                            <p style={styles.pageSubtitle}>Manage lab spaces and associate them with departments</p>
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
                                            <td style={styles.td}>
                                                {lab.department ? lab.department.departmentName : ""}
                                            </td>
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
                            <p style={styles.pageSubtitle}>Manage lab instruments, availability, and metadata</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingEquipmentId ? "Edit Equipment" : "Add New Equipment"}
                            </h3>
                            <div style={styles.formGrid}>
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
                                                {lab.laboratoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={saveEquipment} style={styles.primaryButton}>
                                {editingEquipmentId ? "Update Equipment" : "Save Equipment"}
                            </button>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Equipment Inventory</h3>
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
                                        <th style={styles.th}>Location</th>
                                        <th style={styles.th}>Laboratory</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {equipmentList.map((equipment) => (
                                        <tr key={equipment.id}>
                                            <td style={styles.td}>{equipment.id}</td>
                                            <td style={styles.td}>{equipment.equipmentName}</td>
                                            <td style={styles.td}>{equipment.equipmentCode}</td>
                                            <td style={styles.td}>{equipment.manufacturer}</td>
                                            <td style={styles.td}>{equipment.modelNumber}</td>
                                            <td style={styles.td}>{equipment.status}</td>
                                            <td style={styles.td}>{equipment.availability}</td>
                                            <td style={styles.td}>{equipment.location}</td>
                                            <td style={styles.td}>
                                                {equipment.laboratory ? equipment.laboratory.laboratoryName : ""}
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
                            <p style={styles.pageSubtitle}>Manage equipment reservations and approvals</p>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>
                                {editingBookingId ? "Edit Booking" : "Create New Booking"}
                            </h3>
                            <div style={styles.formGrid}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Booked By</label>
                                    <input
                                        type="text"
                                        placeholder="Booked By"
                                        value={bookedBy}
                                        onChange={(e) => setBookedBy(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Booking Date</label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Start Time</label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>End Time</label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Purpose</label>
                                    <input
                                        type="text"
                                        placeholder="Purpose"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Status</label>
                                    <select
                                        value={bookingStatus}
                                        onChange={(e) => setBookingStatus(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Select Equipment</label>
                                    <select
                                        value={selectedEquipmentId}
                                        onChange={(e) => setSelectedEquipmentId(e.target.value)}
                                        style={styles.select}
                                    >
                                        <option value="">Select Equipment</option>
                                        {equipmentList.map((equipment) => (
                                            <option key={equipment.id} value={equipment.id}>
                                                {equipment.equipmentName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button onClick={saveBooking} style={styles.primaryButton}>
                                {editingBookingId ? "Update Booking" : "Book Equipment"}
                            </button>
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Bookings Schedule</h3>
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Booked By</th>
                                        <th style={styles.th}>Equipment</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Time</th>
                                        <th style={styles.th}>Purpose</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {bookingList.map((booking) => (
                                        <tr key={booking.id}>
                                            <td style={styles.td}>{booking.id}</td>
                                            <td style={styles.td}>{booking.bookedBy}</td>
                                            <td style={styles.td}>{booking.equipment?.equipmentName}</td>
                                            <td style={styles.td}>{booking.bookingDate}</td>
                                            <td style={styles.td}>{booking.startTime} - {booking.endTime}</td>
                                            <td style={styles.td}>{booking.purpose}</td>
                                            <td style={styles.td}>{booking.status}</td>
                                            <td style={{ ...styles.td, textAlign: "right" }}>
                                                <button
                                                    onClick={() => editBooking(booking)}
                                                    style={styles.actionButtonEdit}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteBooking(booking.id)}
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
            </div>
        </div>
    );
}

export default AdminDashboard;