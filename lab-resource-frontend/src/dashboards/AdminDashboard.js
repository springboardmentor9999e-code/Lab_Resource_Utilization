import React, { useEffect, useState } from "react";
import "../App.css";
import Sidebar from "../admin/Sidebar";
import DashboardPage from "../admin/DashboardPage";
import InstitutionPage from "../admin/InstitutionPage";
import DepartmentPage from "../admin/DepartmentPage";
import LaboratoryPage from "../admin/LaboratoryPage";
import EquipmentPage from "../admin/EquipmentPage";
import BookingPage from "../admin/BookingPage";
import NotificationBell from "../components/NotificationBell";

import {
    getDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment as removeDepartment
} from "../services/departmentService";
import {
    getInstitutions,
    addInstitution,
    updateInstitution,
    deleteInstitution as removeInstitution
} from "../services/institutionService";
import {
    getLaboratories,
    addLaboratory,
    updateLaboratory,
    deleteLaboratory as removeLaboratory
} from "../services/laboratoryService";
import {
    getEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment as removeEquipment
} from "../services/equipmentService";
import {
    getBookings,
    addBooking,
    updateBooking,
    deleteBooking as removeBooking
} from "../services/bookingService";
import { getDashboard } from "../services/dashboardService";

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
    const [equipmentCost, setEquipmentCost] = useState("");

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
            const response = await getDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // ===========================
    // Department APIs
    // ===========================

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments();
            setDepartments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const saveDepartment = async () => {
        if (departmentName.trim() === "") return;

        try {
            if (editingDepartmentId === null) {
                await addDepartment({
                    departmentName
                });
            } else {
                await updateDepartment(editingDepartmentId, {
                    departmentName
                });

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
            await removeDepartment(id);
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
            const response = await getInstitutions();
            setInstitutions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const saveInstitution = async () => {
        if (institutionName.trim() === "") return;

        try {

            if (editingInstitutionId === null) {
                await addInstitution({
                    institutionName
                });
            } else {
                await updateInstitution(
                    editingInstitutionId,
                    {
                        institutionName
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
            await removeInstitution(id);
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
            const response = await getLaboratories();
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
                await addLaboratory(body);
            } else {
                await updateLaboratory(
                    editingLaboratoryId,
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
            await removeLaboratory(id);
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
            const response = await getEquipment();
            setEquipmentList(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await getBookings();
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
                equipmentCost,
                laboratory: {
                    id: selectedLaboratoryId
                }
            };

            if (editingEquipmentId === null) {
                await addEquipment(body);
            } else {
                await updateEquipment(
                    editingEquipmentId,
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
            setEquipmentCost("");
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
                await updateBooking(
                    editingBookingId,
                    booking
                );
            } else {
                await addBooking(booking);
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
        setEquipmentCost(equipment.equipmentCost || "");

        if (equipment.laboratory) {
            setSelectedLaboratoryId(equipment.laboratory.id);
        }

        setEditingEquipmentId(equipment.id);
    };

    const deleteEquipment = async (id) => {

        try {
            await removeEquipment(id);
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
            await removeBooking(id);
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

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <Sidebar
                activePage={activePage}
                setActivePage={setActivePage}
                styles={styles}
            />

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Header Area with Notification Bell */}
                <div style={styles.headerArea}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <div>
                            <h1 style={styles.pageTitle}>Dashboard Overview</h1>
                            <p style={styles.pageSubtitle}>System metrics and resource summaries</p>
                        </div>
                        <NotificationBell />
                    </div>
                </div>

                {/* DASHBOARD PAGE */}
                {activePage === "dashboard" && (
                    <DashboardPage
                        dashboard={dashboard}
                        styles={styles}
                    />
                )}

                {/* INSTITUTIONS PAGE */}
                {activePage === "institutions" && (
                    <InstitutionPage
                        styles={styles}
                        institutions={institutions}
                        institutionName={institutionName}
                        setInstitutionName={setInstitutionName}
                        editingInstitutionId={editingInstitutionId}
                        saveInstitution={saveInstitution}
                        editInstitution={editInstitution}
                        deleteInstitution={deleteInstitution}
                    />
                )}

                {/* DEPARTMENTS PAGE */}
                {activePage === "departments" && (
                    <DepartmentPage
                        styles={styles}
                        departments={departments}
                        departmentName={departmentName}
                        setDepartmentName={setDepartmentName}
                        editingDepartmentId={editingDepartmentId}
                        saveDepartment={saveDepartment}
                        editDepartment={editDepartment}
                        deleteDepartment={deleteDepartment}
                    />
                )}

                {/* LABORATORIES PAGE */}
                {activePage === "laboratories" && (
                    <LaboratoryPage
                        styles={styles}
                        laboratories={laboratories}
                        laboratoryName={laboratoryName}
                        setLaboratoryName={setLaboratoryName}
                        departments={departments}
                        selectedDepartmentId={selectedDepartmentId}
                        setSelectedDepartmentId={setSelectedDepartmentId}
                        editingLaboratoryId={editingLaboratoryId}
                        saveLaboratory={saveLaboratory}
                        editLaboratory={editLaboratory}
                        deleteLaboratory={deleteLaboratory}
                    />
                )}

                {/* EQUIPMENT PAGE */}
                {activePage === "equipment" && (
                    <EquipmentPage
                        styles={styles}
                        equipmentList={equipmentList}
                        equipmentName={equipmentName}
                        setEquipmentName={setEquipmentName}
                        equipmentCode={equipmentCode}
                        setEquipmentCode={setEquipmentCode}
                        manufacturer={manufacturer}
                        setManufacturer={setManufacturer}
                        modelNumber={modelNumber}
                        setModelNumber={setModelNumber}
                        description={description}
                        setDescription={setDescription}
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        documentation={documentation}
                        setDocumentation={setDocumentation}
                        purchaseDate={purchaseDate}
                        setPurchaseDate={setPurchaseDate}
                        calibrationDate={calibrationDate}
                        setCalibrationDate={setCalibrationDate}
                        certificationDate={certificationDate}
                        setCertificationDate={setCertificationDate}
                        status={status}
                        setStatus={setStatus}
                        availability={availability}
                        setAvailability={setAvailability}
                        location={location}
                        setLocation={setLocation}
                        equipmentCost={equipmentCost}
                        setEquipmentCost={setEquipmentCost}
                        laboratories={laboratories}
                        selectedLaboratoryId={selectedLaboratoryId}
                        setSelectedLaboratoryId={setSelectedLaboratoryId}
                        editingEquipmentId={editingEquipmentId}
                        saveEquipment={saveEquipment}
                        editEquipment={editEquipment}
                        deleteEquipment={deleteEquipment}
                    />
                )}

                {/* BOOKINGS PAGE */}
                {activePage === "bookings" && (
                    <BookingPage
                        styles={styles}
                        bookingList={bookingList}
                        bookedBy={bookedBy}
                        setBookedBy={setBookedBy}
                        bookingDate={bookingDate}
                        setBookingDate={setBookingDate}
                        startTime={startTime}
                        setStartTime={setStartTime}
                        endTime={endTime}
                        setEndTime={setEndTime}
                        purpose={purpose}
                        setPurpose={setPurpose}
                        bookingStatus={bookingStatus}
                        setBookingStatus={setBookingStatus}
                        equipmentList={equipmentList}
                        selectedEquipmentId={selectedEquipmentId}
                        setSelectedEquipmentId={setSelectedEquipmentId}
                        editingBookingId={editingBookingId}
                        saveBooking={saveBooking}
                        editBooking={editBooking}
                        deleteBooking={deleteBooking}
                    />
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;