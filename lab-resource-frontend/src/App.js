import MaintenanceNotifications from "./components/MaintenanceNotifications";
import Users from "./components/Users";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login";
import AdminDashboard from "./dashboards/AdminDashboard";
import DepartmentHeadDashboard from "./dashboards/DepartmentHeadDashboard";
import LabTechnicianDashboard from "./dashboards/LabTechnicianDashboard";
import ResearcherDashboard from "./dashboards/ResearcherDashboard";
import ScientistDashboard from "./dashboards/ScientistDashboard";
import StudentDashboard from "./dashboards/StudentDashboard";


const token = localStorage.getItem("token");

axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

function App() {

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
    const [isLoggedIn, setIsLoggedIn] = useState(
        localStorage.getItem("token") !== null
    );

    const [role, setRole] = useState(
        localStorage.getItem("role")
    );
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

    if (!isLoggedIn) {
        return (
            <Login
                onLogin={(userRole) => {
                    setIsLoggedIn(true);
                    setRole(userRole);
                }}
            />
        );
    }
    if (role === "SYSTEM_ADMIN") {
        return <AdminDashboard />;
    }

    if (role === "DEPARTMENT_HEAD") {
        return <DepartmentHeadDashboard />;
    }

    if (role === "LAB_TECHNICIAN") {
        return <LabTechnicianDashboard />;
    }

    if (role === "RESEARCHER") {
        return <ResearcherDashboard />;
    }

    if (role === "SCIENTIST") {
        return <ScientistDashboard />;
    }

    if (role === "STUDENT") {
        return <StudentDashboard />;
    }

    // ===========================
    // UI
    // ===========================

    return (
        <div className="App">
            <button
                onClick={() => {
                    localStorage.removeItem("token");
                    window.location.reload();
                }}
            >
                Logout
            </button>
            <h2>Dashboard</h2>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap" }}>

                <div style={{ border: "1px solid black", padding: "15px", width: "180px" }}>
                    <h3>Institutions</h3>
                    <h2>{dashboard.totalInstitutions}</h2>
                </div>

                <div style={{ border: "1px solid black", padding: "15px", width: "180px" }}>
                    <h3>Departments</h3>
                    <h2>{dashboard.totalDepartments}</h2>
                </div>

                <div style={{ border: "1px solid black", padding: "15px", width: "180px" }}>
                    <h3>Laboratories</h3>
                    <h2>{dashboard.totalLaboratories}</h2>
                </div>

                <div style={{ border: "1px solid black", padding: "15px", width: "180px" }}>
                    <h3>Equipment</h3>
                    <h2>{dashboard.totalEquipment}</h2>
                </div>

                <div style={{ border: "1px solid black", padding: "15px", width: "180px" }}>
                    <h3>Bookings</h3>
                    <h2>{dashboard.totalBookings}</h2>
                </div>

            </div>

            <h1>Lab Resource Management System</h1>
            <div style={{ marginBottom: "20px" }}>
                <button onClick={() => window.scrollTo(0, 0)}>Dashboard</button>

                <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => {
                        const section = document.getElementById("users-section");
                        if (section) {
                            section.scrollIntoView({ behavior: "smooth" });
                        }
                    }}
                >
                    Users
                </button>
            </div>

            {/* ===========================
          Departments
      =========================== */}

            <section>

                <h2>Departments</h2>

                <input
                    type="text"
                    placeholder="Department Name"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                />

                <button onClick={saveDepartment}>
                    {editingDepartmentId ? "Update" : "Add"}
                </button>

                <table border="1" cellPadding="8">

                    <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>

                    </thead>

                    <tbody>

                    {departments.map((department) => (

                        <tr key={department.id}>

                            <td>{department.id}</td>

                            <td>{department.departmentName}</td>

                            <td>

                                <button
                                    onClick={() =>
                                        editDepartment(department)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        deleteDepartment(department.id)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </section>

            <hr />

            {/* ===========================
          Institutions
      =========================== */}

            <section>

                <h2>Institutions</h2>

                <input
                    type="text"
                    placeholder="Institution Name"
                    value={institutionName}
                    onChange={(e) =>
                        setInstitutionName(e.target.value)
                    }
                />

                <button onClick={saveInstitution}>
                    {editingInstitutionId ? "Update" : "Add"}
                </button>

                <table border="1" cellPadding="8">

                    <thead>

                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>

                    </thead>

                    <tbody>

                    {institutions.map((institution) => (

                        <tr key={institution.id}>

                            <td>{institution.id}</td>

                            <td>{institution.institutionName}</td>

                            <td>

                                <button
                                    onClick={() =>
                                        editInstitution(institution)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() =>
                                        deleteInstitution(institution.id)
                                    }
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </section>

            <hr />
            {/* ===========================
          Laboratories
      =========================== */}

            <section>

                <h2>Laboratories</h2>

                <input
                    type="text"
                    placeholder="Laboratory Name"
                    value={laboratoryName}
                    onChange={(e) => setLaboratoryName(e.target.value)}
                />

                <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                >
                    <option value="">Select Department</option>

                    {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                            {department.departmentName}
                        </option>
                    ))}
                </select>

                <button onClick={saveLaboratory}>
                    {editingLaboratoryId ? "Update" : "Add"}
                </button>

                <table border="1" cellPadding="8">

                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Laboratory</th>
                        <th>Department</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>

                    {laboratories.map((lab) => (

                        <tr key={lab.id}>

                            <td>{lab.id}</td>

                            <td>{lab.laboratoryName}</td>

                            <td>
                                {lab.department
                                    ? lab.department.departmentName
                                    : ""}
                            </td>

                            <td>

                                <button
                                    onClick={() => editLaboratory(lab)}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteLaboratory(lab.id)}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </section>

            <hr />

            {/* ===========================
          Equipment
      =========================== */}

            {/* ===========================
    Equipment
=========================== */}

            {/* ===========================
    Equipment
=========================== */}

            <section>

                <h2>Equipment</h2>

                <input
                    type="text"
                    placeholder="Equipment Name"
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Equipment Code"
                    value={equipmentCode}
                    onChange={(e) => setEquipmentCode(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Manufacturer"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Model Number"
                    value={modelNumber}
                    onChange={(e) => setModelNumber(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Documentation"
                    value={documentation}
                    onChange={(e) => setDocumentation(e.target.value)}
                />

                <label>Purchase Date</label>
                <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                />

                <label>Calibration Date</label>
                <input
                    type="date"
                    value={calibrationDate}
                    onChange={(e) => setCalibrationDate(e.target.value)}
                />

                <label>Certification Date</label>
                <input
                    type="date"
                    value={certificationDate}
                    onChange={(e) => setCertificationDate(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Availability"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <select
                    value={selectedLaboratoryId}
                    onChange={(e) => setSelectedLaboratoryId(e.target.value)}
                >
                    <option value="">Select Laboratory</option>

                    {laboratories.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                            {lab.laboratoryName}
                        </option>
                    ))}
                </select>

                <button onClick={saveEquipment}>
                    {editingEquipmentId ? "Update" : "Add"}
                </button>

                <table border="1" cellPadding="8">

                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Manufacturer</th>
                        <th>Model</th>
                        <th>Status</th>
                        <th>Availability</th>
                        <th>Location</th>
                        <th>Laboratory</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>

                    {equipmentList.map((equipment) => (

                        <tr key={equipment.id}>

                            <td>{equipment.id}</td>
                            <td>{equipment.equipmentName}</td>
                            <td>{equipment.equipmentCode}</td>
                            <td>{equipment.manufacturer}</td>
                            <td>{equipment.modelNumber}</td>
                            <td>{equipment.status}</td>
                            <td>{equipment.availability}</td>
                            <td>{equipment.location}</td>

                            <td>
                                {equipment.laboratory
                                    ? equipment.laboratory.laboratoryName
                                    : ""}
                            </td>

                            <td>

                                <button
                                    onClick={() => editEquipment(equipment)}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteEquipment(equipment.id)}
                                >
                                    Delete
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </section>
            {/* ===================== Booking ===================== */}

            <div className="card">
                <hr />

                <div id="users-section">
                    <Users />
                </div>
                <h2>Booking</h2>

                <input
                    type="text"
                    placeholder="Booked By"
                    value={bookedBy}
                    onChange={(e) => setBookedBy(e.target.value)}
                />

                <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                />

                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />

                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                />

                <select
                    value={bookingStatus}
                    onChange={(e) => setBookingStatus(e.target.value)}
                >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                >
                    <option value="">Select Equipment</option>

                    {equipmentList.map((equipment) => (
                        <option key={equipment.id} value={equipment.id}>
                            {equipment.equipmentName}
                        </option>
                    ))}
                </select>

                <button onClick={saveBooking}>
                    {editingBookingId ? "Update Booking" : "Book Equipment"}
                </button>

                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Booked By</th>
                        <th>Equipment</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {bookingList.map((booking) => (
                        <tr key={booking.id}>
                            <td>{booking.id}</td>
                            <td>{booking.bookedBy}</td>
                            <td>{booking.equipment?.equipmentName}</td>
                            <td>{booking.bookingDate}</td>
                            <td>{booking.startTime} - {booking.endTime}</td>
                            <td>{booking.purpose}</td>
                            <td>{booking.status}</td>

                            <td>
                                <button
                                    onClick={() => editBooking(booking)}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteBooking(booking.id)}
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
    );
}

export default App;