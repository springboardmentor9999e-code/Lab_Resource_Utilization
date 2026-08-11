import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Form, Modal, Badge } from "react-bootstrap";
import { 
    FaUniversity, 
    FaUsers, 
    FaLaptop, 
    FaPlusCircle, 
    FaEdit, 
    FaTrash, 
    FaBuilding,
    FaClipboardList,
    FaTools,
    FaChartLine,
    FaDollarSign
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";
import * as labService from "../../services/laboratoryService";
import * as equipService from "../../services/equipmentService";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";
import ConfirmationModal from "../common/ConfirmationModal";

// Register ChartJS elements
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function SystemAdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLaboratories: 0,
        totalEquipment: 0,
        totalInstitutions: 0,
        totalDepartments: 0,
        activeBookings: 0,
        totalMaintenance: 0,
        overallUtilization: 0,
        overallUtilizationCost: 0,
        totalSharedEquipment: 0,
        totalInterInstituteRequests: 0,
        crossInstituteUtilization: 0,
        topSharedEquipment: [],
        topInstitutesByResourceSharing: [],
        institutionComparison: [],
        bookingTrend: {},
        maintenanceTrend: {}
    });
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Directory tab selection
    const [activeTab, setActiveTab] = useState("analytics");

    // Add institution modal state
    const [showModal, setShowModal] = useState(false);
    const [newInst, setNewInst] = useState({
        institutionName: "",
        institutionCode: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        status: "ACTIVE"
    });

    // Edit institution modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInstId, setSelectedInstId] = useState(null);
    const [editInst, setEditInst] = useState({
        institutionName: "",
        institutionCode: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        contactEmail: "",
        contactPhone: "",
        website: "",
        status: "ACTIVE"
    });

    // Add department modal state
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [newDept, setNewDept] = useState({
        departmentName: "",
        departmentCode: "",
        hodName: "",
        contactEmail: "",
        contactPhone: "",
        status: "ACTIVE",
        institution: {
            institutionId: ""
        }
    });

    // Edit department modal state
    const [showEditDeptModal, setShowEditDeptModal] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState(null);
    const [editDept, setEditDept] = useState({
        departmentName: "",
        departmentCode: "",
        hodName: "",
        contactEmail: "",
        contactPhone: "",
        status: "ACTIVE",
        institution: {
            institutionId: ""
        }
    });

    // Laboratories State
    const [laboratories, setLaboratories] = useState([]);
    const [showLabModal, setShowLabModal] = useState(false);
    const [showEditLabModal, setShowEditLabModal] = useState(false);
    const [selectedLabId, setSelectedLabId] = useState(null);
    const [newLab, setNewLab] = useState({
        labName: "",
        description: "",
        department: { departmentId: "" }
    });
    const [editLab, setEditLab] = useState({
        labName: "",
        description: "",
        department: { departmentId: "" }
    });
    const [labSearch, setLabSearch] = useState("");
    const [labDeptFilter, setLabDeptFilter] = useState("");
    const [labPage, setLabPage] = useState(1);

    // Equipment State
    const [equipment, setEquipment] = useState([]);
    const [showEquipModal, setShowEquipModal] = useState(false);
    const [showEditEquipModal, setShowEditEquipModal] = useState(false);
    const [selectedEquipId, setSelectedEquipId] = useState(null);
    const [newEquip, setNewEquip] = useState({
        equipmentName: "",
        category: "",
        description: "",
        specifications: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiryDate: "",
        totalQuantity: 1,
        availableQuantity: 1,
        status: "AVAILABLE",
        imageUrl: "",
        documentUrl: "",
        costPerHour: 0.0,
        departmentId: "",
        laboratory: { labId: "" },
        calibrationFrequency: "Every 3 Months",
        lastCalibrationDate: "",
        nextCalibrationDate: "",
        calibrationStatus: "Scheduled",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
        licenseRenewalFrequency: "Every 6 Months",
        licenseRenewalDate: "",
        certificateNumber: "",
        certificateIssueDate: "",
        certificateExpiryDate: "",
        certificateRenewalFrequency: "Every 6 Months",
        certificateRenewalDate: ""
    });
    const [editEquip, setEditEquip] = useState({
        equipmentName: "",
        category: "",
        description: "",
        specifications: "",
        manufacturer: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiryDate: "",
        totalQuantity: 1,
        availableQuantity: 1,
        status: "AVAILABLE",
        imageUrl: "",
        documentUrl: "",
        costPerHour: 0.0,
        departmentId: "",
        laboratory: { labId: "" },
        calibrationFrequency: "Every 3 Months",
        lastCalibrationDate: "",
        nextCalibrationDate: "",
        calibrationStatus: "Scheduled",
        licenseNumber: "",
        licenseIssueDate: "",
        licenseExpiryDate: "",
        licenseRenewalFrequency: "Every 6 Months",
        licenseRenewalDate: "",
        certificateNumber: "",
        certificateIssueDate: "",
        certificateExpiryDate: "",
        certificateRenewalFrequency: "Every 6 Months",
        certificateRenewalDate: ""
    });
    const [equipSearch, setEquipSearch] = useState("");
    const [equipCatFilter, setEquipCatFilter] = useState("");
    const [equipStatusFilter, setEquipStatusFilter] = useState("");
    const [equipLabFilter, setEquipLabFilter] = useState("");
    const [equipPage, setEquipPage] = useState(1);
    const [uploadingFile, setUploadingFile] = useState(false);

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Load general stats and realtime analytics
            const statsRes = await axios.get("http://localhost:8080/api/dashboard/realtime", { headers });
            setStats(statsRes.data);

            // Load institutions
            const instRes = await institutionService.getAllInstitutions();
            setInstitutions(instRes.data);

            // Load departments
            const deptRes = await departmentService.getAllDepartments();
            setDepartments(deptRes.data);

            // Load laboratories
            const labRes = await labService.getAllLaboratories();
            setLaboratories(labRes.data);

            // Load equipment
            const equipRes = await equipService.getAllEquipment();
            setEquipment(equipRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error loading system admin data", error);
            setLoading(false);
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", action: null });

    const triggerConfirm = (title, message, callback) => {
        setConfirmConfig({
            title,
            message,
            action: () => {
                callback();
                setShowConfirm(false);
            }
        });
        setShowConfirm(true);
    };

    useEffect(() => {
        loadData();
        const intervalId = setInterval(loadData, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInst(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditInst(prev => ({ ...prev, [name]: value }));
    };

    const handleDeptInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "institutionId") {
            setNewDept(prev => ({
                ...prev,
                institution: { institutionId: value }
            }));
        } else {
            setNewDept(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditDeptInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "institutionId") {
            setEditDept(prev => ({
                ...prev,
                institution: { institutionId: value }
            }));
        } else {
            setEditDept(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddInstitution = async (e) => {
        e.preventDefault();
        try {
            await institutionService.addInstitution(newInst);
            alert("Institution successfully added!");
            setShowModal(false);
            setNewInst({
                institutionName: "",
                institutionCode: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                contactEmail: "",
                contactPhone: "",
                website: "",
                status: "ACTIVE"
            });
            loadData();
        } catch (error) {
            console.error("Error adding institution", error);
            alert("Failed to add institution. Ensure code and name are unique.");
        }
    };

    const handleEditClick = (inst) => {
        setSelectedInstId(inst.institutionId);
        setEditInst({
            institutionName: inst.institutionName || "",
            institutionCode: inst.institutionCode || "",
            address: inst.address || "",
            city: inst.city || "",
            state: inst.state || "",
            pincode: inst.pincode || "",
            contactEmail: inst.contactEmail || "",
            contactPhone: inst.contactPhone || "",
            website: inst.website || "",
            status: inst.status || "ACTIVE"
        });
        setShowEditModal(true);
    };

    const handleEditInstitution = async (e) => {
        e.preventDefault();
        try {
            await institutionService.updateInstitution(selectedInstId, editInst);
            alert("Institution successfully updated!");
            setShowEditModal(false);
            loadData();
        } catch (error) {
            console.error("Error updating institution", error);
            alert("Failed to update institution.");
        }
    };

    const handleDeleteClick = async (id) => {
        triggerConfirm("Delete Institution", "Are you sure you want to remove this institution? This action will delete the institution and cannot be undone.", async () => {
            try {
                await institutionService.deleteInstitution(id);
                alert("Institution successfully removed.");
                loadData();
            } catch (error) {
                console.error("Error deleting institution", error);
                alert("Failed to delete institution. It may have associated departments, laboratories, or users.");
            }
        });
    };

    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDept.institution.institutionId) {
            alert("Please select an institution.");
            return;
        }
        try {
            await departmentService.addDepartment(newDept);
            alert("Department successfully added!");
            setShowDeptModal(false);
            setNewDept({
                departmentName: "",
                departmentCode: "",
                hodName: "",
                contactEmail: "",
                contactPhone: "",
                status: "ACTIVE",
                institution: { institutionId: "" }
            });
            loadData();
        } catch (error) {
            console.error("Error adding department", error);
            alert("Failed to add department. Ensure code and name are unique.");
        }
    };

    const handleEditDeptClick = (dept) => {
        setSelectedDeptId(dept.departmentId);
        setEditDept({
            departmentName: dept.departmentName || "",
            departmentCode: dept.departmentCode || "",
            hodName: dept.hodName || "",
            contactEmail: dept.contactEmail || "",
            contactPhone: dept.contactPhone || "",
            status: dept.status || "ACTIVE",
            institution: {
                institutionId: dept.institution?.institutionId || ""
            }
        });
        setShowEditDeptModal(true);
    };

    const handleEditDepartment = async (e) => {
        e.preventDefault();
        if (!editDept.institution.institutionId) {
            alert("Please select an institution.");
            return;
        }
        try {
            await departmentService.updateDepartment(selectedDeptId, editDept);
            alert("Department successfully updated!");
            setShowEditDeptModal(false);
            loadData();
        } catch (error) {
            console.error("Error updating department", error);
            alert("Failed to update department.");
        }
    };

    const handleDeleteDeptClick = async (id) => {
        triggerConfirm("Delete Department", "Are you sure you want to remove this department? This action cannot be undone.", async () => {
            try {
                await departmentService.deleteDepartment(id);
                alert("Department successfully removed.");
                loadData();
            } catch (error) {
                console.error("Error deleting department", error);
                alert("Failed to delete department. It may have associated laboratories or equipment.");
            }
        });
    };

    // Lab event handlers
    const handleLabInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "departmentId") {
            setNewLab(prev => ({
                ...prev,
                department: { departmentId: value }
            }));
        } else {
            setNewLab(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditLabInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "departmentId") {
            setEditLab(prev => ({
                ...prev,
                department: { departmentId: value }
            }));
        } else {
            setEditLab(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddLab = async (e) => {
        e.preventDefault();
        if (!newLab.department.departmentId) {
            alert("Please select a department.");
            return;
        }
        try {
            await labService.addLaboratory(newLab);
            alert("Laboratory successfully registered!");
            setShowLabModal(false);
            loadData();
        } catch (error) {
            console.error("Error adding laboratory", error);
            alert(error.response?.data?.message || "Failed to register laboratory. Duplicate names in the same department are not allowed.");
        }
    };

    const handleEditLabClick = (lab) => {
        setSelectedLabId(lab.labId);
        setEditLab({
            labName: lab.labName,
            description: lab.description || "",
            department: { departmentId: lab.department?.departmentId || "" }
        });
        setShowEditLabModal(true);
    };

    const handleEditLabSubmit = async (e) => {
        e.preventDefault();
        if (!editLab.department.departmentId) {
            alert("Please select a department.");
            return;
        }
        try {
            await labService.updateLaboratory(selectedLabId, editLab);
            alert("Laboratory details successfully modified!");
            setShowEditLabModal(false);
            loadData();
        } catch (error) {
            console.error("Error updating laboratory", error);
            alert(error.response?.data?.message || "Failed to update laboratory. Duplicate names in the same department are not allowed.");
        }
    };

    const handleDeleteLabClick = async (id) => {
        triggerConfirm("Delete Laboratory", "Are you sure you want to delete this laboratory? This action cannot be undone.", async () => {
            try {
                await labService.deleteLaboratory(id);
                alert("Laboratory successfully removed.");
                loadData();
            } catch (error) {
                console.error("Error deleting laboratory", error);
                alert("Failed to delete laboratory.");
            }
        });
    };

    // Equipment event handlers
    const handleEquipInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "labId") {
            setNewEquip(prev => ({
                ...prev,
                laboratory: { labId: value }
            }));
        } else {
            setNewEquip(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditEquipInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "labId") {
            setEditEquip(prev => ({
                ...prev,
                laboratory: { labId: value }
            }));
        } else {
            setEditEquip(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadingFile(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:8080/api/equipment/upload", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            const imageUrl = res.data;
            if (isEdit) {
                setEditEquip(prev => ({ ...prev, imageUrl }));
            } else {
                setNewEquip(prev => ({ ...prev, imageUrl }));
            }
            alert("Equipment image uploaded successfully!");
        } catch (error) {
            console.error("Error uploading image", error);
            alert("Failed to upload image.");
        } finally {
            setUploadingFile(false);
        }
    };

    const handleAddEquip = async (e) => {
        e.preventDefault();
        if (!newEquip.laboratory.labId) {
            alert("Please select a laboratory.");
            return;
        }
        try {
            const payload = {
                ...newEquip,
                availableQuantity: newEquip.totalQuantity
            };
            await equipService.addEquipment(payload);
            alert("Equipment successfully registered!");
            setShowEquipModal(false);
            loadData();
        } catch (error) {
            console.error("Error adding equipment", error);
            alert(error.response?.data?.message || "Failed to register equipment. Check for duplicate serial numbers.");
        }
    };

    const handleEditEquipClick = (equip) => {
        setSelectedEquipId(equip.id);
        setEditEquip({
            equipmentName: equip.equipmentName,
            category: equip.category,
            description: equip.description || "",
            specifications: equip.specifications || "",
            manufacturer: equip.manufacturer || "",
            model: equip.model || "",
            serialNumber: equip.serialNumber || "",
            purchaseDate: equip.purchaseDate || "",
            warrantyExpiryDate: equip.warrantyExpiryDate || "",
            totalQuantity: equip.totalQuantity || 1,
            availableQuantity: equip.availableQuantity || 1,
            status: equip.status || "AVAILABLE",
            imageUrl: equip.imageUrl || "",
            documentUrl: equip.documentUrl || "",
            costPerHour: equip.costPerHour || 0.0,
            departmentId: equip.laboratory?.department?.departmentId || "",
            laboratory: { labId: equip.laboratory?.labId || "" },
            calibrationFrequency: equip.calibrationFrequency || "Every 3 Months",
            lastCalibrationDate: equip.lastCalibrationDate || "",
            nextCalibrationDate: equip.nextCalibrationDate || "",
            calibrationStatus: equip.calibrationStatus || "Scheduled",
            licenseNumber: equip.licenseNumber || "",
            licenseIssueDate: equip.licenseIssueDate || "",
            licenseExpiryDate: equip.licenseExpiryDate || "",
            licenseRenewalFrequency: equip.licenseRenewalFrequency || "Every 6 Months",
            licenseRenewalDate: equip.licenseRenewalDate || "",
            certificateNumber: equip.certificateNumber || "",
            certificateIssueDate: equip.certificateIssueDate || "",
            certificateExpiryDate: equip.certificateExpiryDate || "",
            certificateRenewalFrequency: equip.certificateRenewalFrequency || "Every 6 Months",
            certificateRenewalDate: equip.certificateRenewalDate || ""
        });
        setShowEditEquipModal(true);
    };

    const handleEditEquipSubmit = async (e) => {
        e.preventDefault();
        if (!editEquip.laboratory.labId) {
            alert("Please select a laboratory.");
            return;
        }
        try {
            await equipService.updateEquipment(selectedEquipId, editEquip);
            alert("Equipment details successfully modified!");
            setShowEditEquipModal(false);
            loadData();
        } catch (error) {
            console.error("Error updating equipment", error);
            alert(error.response?.data?.message || "Failed to update equipment. Check for duplicate serial numbers.");
        }
    };

    const handleDeleteEquipClick = async (id) => {
        triggerConfirm("Delete Equipment", "Are you sure you want to delete this equipment? This action cannot be undone.", async () => {
            try {
                await equipService.deleteEquipment(id);
                alert("Equipment successfully removed.");
                loadData();
            } catch (error) {
                console.error("Error deleting equipment", error);
                alert("Failed to delete equipment.");
            }
        });
    };

    return (
        <DashboardLayout title="System Admin Dashboard">
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Administer university organizations, track overall resources, and configure platform configurations.
                    </p>
                </Card.Body>
            </Card>

            {/* Tab selection toggles */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2">
                    <Button 
                        variant={activeTab === "analytics" ? "primary" : "outline-primary"}
                        onClick={() => setActiveTab("analytics")}
                    >
                        System Analytics
                    </Button>
                    <Button 
                        variant={activeTab === "institutions" ? "primary" : "outline-primary"}
                        onClick={() => setActiveTab("institutions")}
                    >
                        Institutions Directory
                    </Button>
                    <Button 
                        variant={activeTab === "departments" ? "primary" : "outline-primary"}
                        onClick={() => setActiveTab("departments")}
                    >
                        Departments Directory
                    </Button>
                    <Button 
                        variant={activeTab === "laboratories" ? "primary" : "outline-primary"}
                        onClick={() => setActiveTab("laboratories")}
                    >
                        Laboratories Directory
                    </Button>
                    <Button 
                        variant={activeTab === "equipment" ? "primary" : "outline-primary"}
                        onClick={() => setActiveTab("equipment")}
                    >
                        Equipment Directory
                    </Button>
                </div>
                {activeTab === "institutions" ? (
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        <FaPlusCircle className="me-2" /> Add Institution
                    </Button>
                ) : activeTab === "departments" ? (
                    <Button variant="success" onClick={() => setShowDeptModal(true)}>
                        <FaPlusCircle className="me-2" /> Add Department
                    </Button>
                ) : activeTab === "laboratories" ? (
                    <Button variant="success" onClick={() => {
                        setNewLab({ labName: "", description: "", department: { departmentId: "" } });
                        setShowLabModal(true);
                    }}>
                        <FaPlusCircle className="me-2" /> Add Laboratory
                    </Button>
                ) : activeTab === "equipment" ? (
                    <Button variant="success" onClick={() => {
                        setNewEquip({
                            equipmentName: "",
                            category: "",
                            description: "",
                            specifications: "",
                            manufacturer: "",
                            model: "",
                            serialNumber: "",
                            purchaseDate: "",
                            warrantyExpiryDate: "",
                            totalQuantity: 1,
                            availableQuantity: 1,
                            status: "AVAILABLE",
                            imageUrl: "",
                            documentUrl: "",
                            costPerHour: 0.0,
                            departmentId: "",
                            laboratory: { labId: "" },
                            calibrationFrequency: "Every 3 Months",
                            lastCalibrationDate: "",
                            nextCalibrationDate: "",
                            calibrationStatus: "Scheduled",
                            licenseNumber: "",
                            licenseIssueDate: "",
                            licenseExpiryDate: "",
                            licenseRenewalFrequency: "Every 6 Months",
                            licenseRenewalDate: "",
                            certificateNumber: "",
                            certificateIssueDate: "",
                            certificateExpiryDate: "",
                            certificateRenewalFrequency: "Every 6 Months",
                            certificateRenewalDate: ""
                        });
                        setShowEquipModal(true);
                    }}>
                        <FaPlusCircle className="me-2" /> Add Equipment
                    </Button>
                ) : null}
            </div>

            {/* Directory list container */}
            <Card className="shadow mb-4">
                <Card.Body className="p-0">
                    {loading ? (
                        <p className="text-center text-muted mb-0 py-5">Loading data directory...</p>
                    ) : activeTab === "analytics" ? (
                        <div className="p-4">
                            {/* KPI Grid */}
                            <Row className="g-4 mb-4">
                                <Col md={3}>
                                    <Card className="shadow text-center h-100">
                                        <Card.Body>
                                            <FaUniversity size={36} className="text-primary mb-2" />
                                            <h3>{stats.totalInstitutions || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Institutions</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100">
                                        <Card.Body>
                                            <FaBuilding size={36} className="text-success mb-2" />
                                            <h3>{stats.totalDepartments || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Departments</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100">
                                        <Card.Body>
                                            <FaBuilding size={36} className="text-warning mb-2" />
                                            <h3>{stats.totalLaboratories || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Laboratories</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100">
                                        <Card.Body>
                                            <FaLaptop size={36} className="text-danger mb-2" />
                                            <h3>{stats.totalEquipment || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Equipment</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            <Row className="g-4 mb-4">
                                <Col md={3}>
                                    <Card className="shadow text-center h-100 bg-light">
                                        <Card.Body>
                                            <FaUsers size={36} className="text-info mb-2" />
                                            <h3>{stats.totalUsers || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Users</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100 bg-light">
                                        <Card.Body>
                                            <FaClipboardList size={36} className="text-success mb-2" />
                                            <h3>{stats.activeBookings || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Active Bookings</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100 bg-light">
                                        <Card.Body>
                                            <FaTools size={36} className="text-danger mb-2" />
                                            <h3>{stats.totalMaintenance || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Total Maintenance Requests</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={3}>
                                    <Card className="shadow text-center h-100 bg-light">
                                        <Card.Body>
                                            <FaChartLine size={36} className="text-primary mb-2" />
                                            <h3>{stats.overallUtilization || 0}%</h3>
                                            <p className="mb-0 text-muted small fw-bold">Overall Utilization</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            <Row className="g-4 mb-4">
                                <Col md={12}>
                                    <Card className="shadow text-center border-start border-primary border-4">
                                        <Card.Body>
                                            <FaDollarSign size={36} className="text-warning mb-2" />
                                            <h3>₹{stats.overallUtilizationCost || 0}</h3>
                                            <p className="mb-0 text-muted small fw-bold">Overall Utilization Cost</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Global Inter-Institute Resource Sharing Metrics */}
                            <Card className="shadow border-0 mb-4 bg-white">
                                <Card.Header className="bg-dark text-white border-0 py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0 fw-bold">Global Inter-Institute Resource Sharing Overview</h5>
                                    <Badge bg="primary">Cross-Institute Ecosystem</Badge>
                                </Card.Header>
                                <Card.Body>
                                    <Row className="g-3">
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-primary mb-1">{stats.totalOwnedEquipment || stats.totalEquipment || 0}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Total Owned Equipment (Global)</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-success mb-1">{stats.totalSharedEquipment || 0}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Equipment Shared Across Institutes</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-info mb-1">{stats.totalActiveSharingRequests || 0}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Total Active Sharing Requests</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-warning mb-1">{stats.pendingRequests || 0}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Pending Sharing Requests</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-success mb-1">{stats.approvedRequests || 0}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Approved Sharing Requests</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4} sm={6}>
                                            <Card className="text-center h-100 bg-light border-0 shadow-sm">
                                                <Card.Body className="py-3">
                                                    <h3 className="fw-bold text-primary mb-1">₹{((stats.overallUtilizationCost || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                                                    <p className="mb-0 text-muted small fw-bold">Total Inter-Institute Revenue</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Charts */}
                            <Row className="g-4 mb-4">
                                <Col lg={6}>
                                    <Card className="shadow h-100">
                                        <Card.Header className="bg-transparent border-0 py-3">
                                            <h5 className="mb-0 fw-bold">Equipment Count by Institution</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {((stats.institutionComparison || []).length === 0) ? (
                                                <p className="text-center text-muted py-5 mb-0">No data available.</p>
                                            ) : (
                                                <div style={{ width: "100%", height: "220px" }}>
                                                    <Bar data={{
                                                        labels: (stats.institutionComparison || []).map(item => item.name),
                                                        datasets: [
                                                            {
                                                                label: "Equipment Count",
                                                                data: (stats.institutionComparison || []).map(item => item.value),
                                                                backgroundColor: "rgba(54, 162, 235, 0.6)",
                                                                borderColor: "rgba(54, 162, 235, 1)",
                                                                borderWidth: 1,
                                                                borderRadius: 5
                                                            }
                                                        ]
                                                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={3}>
                                    <Card className="shadow h-100">
                                        <Card.Header className="bg-transparent border-0 py-3">
                                            <h5 className="mb-0 fw-bold">Booking Trend</h5>
                                        </Card.Header>
                                        <Card.Body className="d-flex align-items-center justify-content-center">
                                            {Object.keys(stats.bookingTrend || {}).length === 0 ? (
                                                <p className="text-muted">No bookings recorded.</p>
                                            ) : (
                                                <div style={{ width: "100%", height: "180px", position: "relative" }}>
                                                    <Doughnut data={{
                                                        labels: Object.keys(stats.bookingTrend || {}),
                                                        datasets: [
                                                            {
                                                                data: Object.keys(stats.bookingTrend || {}).map(k => stats.bookingTrend[k]),
                                                                backgroundColor: [
                                                                    "rgba(75, 192, 192, 0.6)",
                                                                    "rgba(54, 162, 235, 0.6)",
                                                                    "rgba(255, 206, 86, 0.6)",
                                                                    "rgba(255, 99, 132, 0.6)"
                                                                ],
                                                                borderWidth: 1
                                                            }
                                                        ]
                                                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={3}>
                                    <Card className="shadow h-100">
                                        <Card.Header className="bg-transparent border-0 py-3">
                                            <h5 className="mb-0 fw-bold">Maintenance Trend</h5>
                                        </Card.Header>
                                        <Card.Body className="d-flex align-items-center justify-content-center">
                                            {Object.keys(stats.maintenanceTrend || {}).length === 0 ? (
                                                <p className="text-muted">No maintenance logs.</p>
                                            ) : (
                                                <div style={{ width: "100%", height: "180px", position: "relative" }}>
                                                    <Doughnut data={{
                                                        labels: Object.keys(stats.maintenanceTrend || {}),
                                                        datasets: [
                                                            {
                                                                data: Object.keys(stats.maintenanceTrend || {}).map(k => stats.maintenanceTrend[k]),
                                                                backgroundColor: [
                                                                    "rgba(255, 99, 132, 0.6)",
                                                                    "rgba(255, 206, 86, 0.6)",
                                                                    "rgba(75, 192, 192, 0.6)"
                                                                ],
                                                                borderWidth: 1
                                                            }
                                                        ]
                                                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            {/* Additional Sharing Charts */}
                            <Row className="g-4 mb-4">
                                <Col lg={6}>
                                    <Card className="shadow h-100">
                                        <Card.Header className="bg-transparent border-0 py-3">
                                            <h5 className="mb-0 fw-bold">Top Shared Equipment</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {(!stats.topSharedEquipment || stats.topSharedEquipment.length === 0) ? (
                                                <p className="text-center text-muted py-5 mb-0">No sharing recorded.</p>
                                            ) : (
                                                <div style={{ width: "100%", height: "200px" }}>
                                                    <Bar data={{
                                                        labels: (stats.topSharedEquipment || []).map(item => item.name),
                                                        datasets: [
                                                            {
                                                                label: "Booking Count",
                                                                data: (stats.topSharedEquipment || []).map(item => item.value),
                                                                backgroundColor: "rgba(153, 102, 255, 0.6)",
                                                                borderColor: "rgba(153, 102, 255, 1)",
                                                                borderWidth: 1,
                                                                borderRadius: 5
                                                            }
                                                        ]
                                                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={6}>
                                    <Card className="shadow h-100">
                                        <Card.Header className="bg-transparent border-0 py-3">
                                            <h5 className="mb-0 fw-bold">Top Sharing Institutes</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            {(!stats.topInstitutesByResourceSharing || stats.topInstitutesByResourceSharing.length === 0) ? (
                                                <p className="text-center text-muted py-5 mb-0">No cross-institute sharing logs.</p>
                                            ) : (
                                                <div style={{ width: "100%", height: "200px" }}>
                                                    <Bar data={{
                                                        labels: (stats.topInstitutesByResourceSharing || []).map(item => item.name),
                                                        datasets: [
                                                            {
                                                                label: "Total Transactions",
                                                                data: (stats.topInstitutesByResourceSharing || []).map(item => item.value),
                                                                backgroundColor: "rgba(255, 159, 64, 0.6)",
                                                                borderColor: "rgba(255, 159, 64, 1)",
                                                                borderWidth: 1,
                                                                borderRadius: 5
                                                            }
                                                        ]
                                                    }} options={{ responsive: true, maintainAspectRatio: false }} />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    ) : activeTab === "institutions" ? (
                        institutions.length === 0 ? (
                            <p className="text-center text-muted mb-0 py-5">No institutions registered.</p>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Institution Code</th>
                                        <th>Name</th>
                                        <th>Location</th>
                                        <th>Contact Info</th>
                                        <th>Website</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {institutions.map((inst) => (
                                        <tr key={inst.institutionId}>
                                            <td><strong>{inst.institutionCode}</strong></td>
                                            <td>{inst.institutionName}</td>
                                            <td>{inst.city}, {inst.state}</td>
                                            <td>
                                                <span>{inst.contactEmail}</span>
                                                <br />
                                                <small className="text-muted">{inst.contactPhone}</small>
                                            </td>
                                            <td><a href={`https://${inst.website}`} target="_blank" rel="noreferrer" className="text-info">{inst.website}</a></td>
                                            <td>
                                                <Badge bg={inst.status === "ACTIVE" ? "success" : "danger"}>
                                                    {inst.status}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button variant="link" className="p-0 text-primary" onClick={() => handleEditClick(inst)}>
                                                        <FaEdit size={16} />
                                                    </Button>
                                                    <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteClick(inst.institutionId)}>
                                                        <FaTrash size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )
                    ) : activeTab === "departments" ? (
                        departments.length === 0 ? (
                            <p className="text-center text-muted mb-0 py-5">No departments registered.</p>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Department Code</th>
                                        <th>Name</th>
                                        <th>Institution</th>
                                        <th>HOD Name</th>
                                        <th>Contact Info</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((dept) => (
                                        <tr key={dept.departmentId}>
                                            <td><strong>{dept.departmentCode}</strong></td>
                                            <td>{dept.departmentName}</td>
                                            <td>{dept.institution?.institutionName || <span className="text-muted small">N/A</span>}</td>
                                            <td>{dept.hodName || <span className="text-muted small">Not Assigned</span>}</td>
                                            <td>
                                                <span>{dept.contactEmail}</span>
                                                <br />
                                                <small className="text-muted">{dept.contactPhone}</small>
                                            </td>
                                            <td>
                                                <Badge bg={dept.status === "ACTIVE" ? "success" : "danger"}>
                                                    {dept.status}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button variant="link" className="p-0 text-primary" onClick={() => handleEditDeptClick(dept)}>
                                                        <FaEdit size={16} />
                                                    </Button>
                                                    <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteDeptClick(dept.departmentId)}>
                                                        <FaTrash size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )
                    ) : activeTab === "laboratories" ? (
                        <div className="p-3">
                            <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
                                <Form.Group className="flex-grow-1" style={{ maxWidth: "350px" }}>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Search by Lab name..." 
                                        value={labSearch}
                                        onChange={(e) => { setLabSearch(e.target.value); setLabPage(1); }}
                                    />
                                </Form.Group>
                                <Form.Group style={{ minWidth: "220px" }}>
                                    <Form.Select 
                                        value={labDeptFilter}
                                        onChange={(e) => { setLabDeptFilter(e.target.value); setLabPage(1); }}
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName} ({d.institution?.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            
                            {(() => {
                                const filteredLabs = laboratories.filter(l => {
                                    const matchSearch = l.labName?.toLowerCase().includes(labSearch.toLowerCase());
                                    const matchDept = !labDeptFilter || l.department?.departmentId.toString() === labDeptFilter.toString();
                                    return matchSearch && matchDept;
                                });

                                const itemsPerPage = 10;
                                const totalPages = Math.ceil(filteredLabs.length / itemsPerPage);
                                const indexOfLastItem = labPage * itemsPerPage;
                                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                const currentLabs = filteredLabs.slice(indexOfFirstItem, indexOfLastItem);

                                return filteredLabs.length === 0 ? (
                                    <p className="text-center text-muted mb-0 py-5">No laboratories match the filters.</p>
                                ) : (
                                    <>
                                        <Table striped hover responsive className="mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Department</th>
                                                    <th>Institution</th>
                                                    <th>Description</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentLabs.map((lab) => (
                                                    <tr key={lab.labId}>
                                                        <td><strong>{lab.labName}</strong></td>
                                                        <td>{lab.department?.departmentName || <span className="text-muted small">N/A</span>}</td>
                                                        <td>{lab.department?.institution?.institutionName || <span className="text-muted small">N/A</span>}</td>
                                                        <td>{lab.description || <span className="text-muted small">No description</span>}</td>
                                                        <td className="text-center">
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <Button variant="link" className="p-0 text-primary" onClick={() => handleEditLabClick(lab)}>
                                                                    <FaEdit size={16} />
                                                                </Button>
                                                                <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteLabClick(lab.labId)}>
                                                                    <FaTrash size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light flex-wrap gap-2">
                                            <div className="small text-muted">
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLabs.length)} of {filteredLabs.length} entries
                                            </div>
                                            <div className="d-flex gap-1">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    disabled={labPage === 1}
                                                    onClick={() => setLabPage(prev => prev - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={labPage === i + 1 ? "primary" : "outline-secondary"}
                                                        size="sm"
                                                        onClick={() => setLabPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    disabled={labPage === totalPages || totalPages === 0}
                                                    onClick={() => setLabPage(prev => prev + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    ) : activeTab === "equipment" ? (
                        <div className="p-3">
                            <div className="d-flex justify-content-between mb-3 align-items-center flex-wrap gap-2">
                                <Form.Group className="flex-grow-1" style={{ maxWidth: "250px" }}>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Search name, model, serial..." 
                                        value={equipSearch}
                                        onChange={(e) => { setEquipSearch(e.target.value); setEquipPage(1); }}
                                    />
                                </Form.Group>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Form.Select 
                                        style={{ width: "160px" }}
                                        value={equipCatFilter}
                                        onChange={(e) => { setEquipCatFilter(e.target.value); setEquipPage(1); }}
                                    >
                                        <option value="">All Categories</option>
                                        {Array.from(new Set(equipment.map(e => e.category))).filter(Boolean).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Select 
                                        style={{ width: "160px" }}
                                        value={equipStatusFilter}
                                        onChange={(e) => { setEquipStatusFilter(e.target.value); setEquipPage(1); }}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                                    </Form.Select>
                                    <Form.Select 
                                        style={{ width: "160px" }}
                                        value={equipLabFilter}
                                        onChange={(e) => { setEquipLabFilter(e.target.value); setEquipPage(1); }}
                                    >
                                        <option value="">All Laboratories</option>
                                        {laboratories.map(l => (
                                            <option key={l.labId} value={l.labId}>{l.labName}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </div>
                            
                            {(() => {
                                const filteredEquip = equipment.filter(e => {
                                    const matchSearch = e.equipmentName?.toLowerCase().includes(equipSearch.toLowerCase()) || 
                                                        e.model?.toLowerCase().includes(equipSearch.toLowerCase()) || 
                                                        e.serialNumber?.toLowerCase().includes(equipSearch.toLowerCase()) ||
                                                        e.manufacturer?.toLowerCase().includes(equipSearch.toLowerCase());
                                    const matchCat = !equipCatFilter || e.category === equipCatFilter;
                                    const matchStatus = !equipStatusFilter || e.status === equipStatusFilter;
                                    const matchLab = !equipLabFilter || e.laboratory?.labId.toString() === equipLabFilter.toString();
                                    return matchSearch && matchCat && matchStatus && matchLab;
                                });

                                const itemsPerPage = 10;
                                const totalPages = Math.ceil(filteredEquip.length / itemsPerPage);
                                const indexOfLastItem = equipPage * itemsPerPage;
                                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                const currentEquip = filteredEquip.slice(indexOfFirstItem, indexOfLastItem);

                                return filteredEquip.length === 0 ? (
                                    <p className="text-center text-muted mb-0 py-5">No equipment matches the filters.</p>
                                ) : (
                                    <>
                                        <Table striped hover responsive className="mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Name</th>
                                                    <th>Category</th>
                                                    <th>Serial Number</th>
                                                    <th>Lab & Dept</th>
                                                    <th>Cost/hr</th>
                                                    <th>Quantity</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentEquip.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <img 
                                                                src={item.imageUrl || "/images/equipment/placeholder.jpg"} 
                                                                alt={item.equipmentName} 
                                                                style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "4px" }}
                                                                onError={(e) => { e.target.src = "/images/equipment/placeholder.jpg"; }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <strong>{item.equipmentName}</strong>
                                                            <br />
                                                            <small className="text-muted">{item.manufacturer} - {item.model}</small>
                                                        </td>
                                                        <td>{item.category}</td>
                                                        <td><code className="small">{item.serialNumber}</code></td>
                                                        <td>
                                                            {item.laboratory?.labName || <span className="text-muted small">N/A</span>}
                                                            <br />
                                                            <small className="text-muted">{item.laboratory?.department?.departmentName}</small>
                                                        </td>
                                                        <td>₹{Number(item.costPerHour || 0).toFixed(2)}</td>
                                                        <td>{item.availableQuantity} / {item.totalQuantity}</td>
                                                        <td>
                                                            <Badge bg={item.status === "AVAILABLE" ? "success" : item.status === "BOOKED" ? "primary" : "warning"}>
                                                                {item.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <Button variant="link" className="p-0 text-primary" onClick={() => handleEditEquipClick(item)}>
                                                                    <FaEdit size={16} />
                                                                </Button>
                                                                <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteEquipClick(item.id)}>
                                                                    <FaTrash size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light flex-wrap gap-2">
                                            <div className="small text-muted">
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEquip.length)} of {filteredEquip.length} entries
                                            </div>
                                            <div className="d-flex gap-1">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    disabled={equipPage === 1}
                                                    onClick={() => setEquipPage(prev => prev - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={equipPage === i + 1 ? "primary" : "outline-secondary"}
                                                        size="sm"
                                                        onClick={() => setEquipPage(i + 1)}
                                                    >
                                                        {i + 1}
                                                    </Button>
                                                ))}
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    disabled={equipPage === totalPages || totalPages === 0}
                                                    onClick={() => setEquipPage(prev => prev + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    ) : null}
                </Card.Body>
            </Card>

            {/* Add Institution Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Register New Institution</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddInstitution}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Institution Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="institutionName" required
                                        value={newInst.institutionName} onChange={handleInputChange}
                                        placeholder="e.g. Stanford University"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Institution Code</Form.Label>
                                    <Form.Control 
                                        type="text" name="institutionCode" required
                                        value={newInst.institutionCode} onChange={handleInputChange}
                                        placeholder="e.g. STANFORD"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control 
                                        type="text" name="address" required
                                        value={newInst.address} onChange={handleInputChange}
                                        placeholder="Enter full physical address"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control 
                                        type="text" name="city" required
                                        value={newInst.city} onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>State</Form.Label>
                                    <Form.Control 
                                        type="text" name="state" required
                                        value={newInst.state} onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Pincode</Form.Label>
                                    <Form.Control 
                                        type="text" name="pincode" required
                                        value={newInst.pincode} onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control 
                                        type="email" name="contactEmail" required
                                        value={newInst.contactEmail} onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Phone</Form.Label>
                                    <Form.Control 
                                        type="text" name="contactPhone" required
                                        value={newInst.contactPhone} onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Website (without https://)</Form.Label>
                                    <Form.Control 
                                        type="text" name="website" required
                                        value={newInst.website} onChange={handleInputChange}
                                        placeholder="e.g. stanford.edu"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Initial Status</Form.Label>
                                    <Form.Select name="status" value={newInst.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" variant="success">Register Institution</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Institution Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modify Institution Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditInstitution}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Institution Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="institutionName" required
                                        value={editInst.institutionName} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Institution Code</Form.Label>
                                    <Form.Control 
                                        type="text" name="institutionCode" required
                                        value={editInst.institutionCode} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control 
                                        type="text" name="address" required
                                        value={editInst.address} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control 
                                        type="text" name="city" required
                                        value={editInst.city} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>State</Form.Label>
                                    <Form.Control 
                                        type="text" name="state" required
                                        value={editInst.state} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Pincode</Form.Label>
                                    <Form.Control 
                                        type="text" name="pincode" required
                                        value={editInst.pincode} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control 
                                        type="email" name="contactEmail" required
                                        value={editInst.contactEmail} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Phone</Form.Label>
                                    <Form.Control 
                                        type="text" name="contactPhone" required
                                        value={editInst.contactPhone} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Website (without https://)</Form.Label>
                                    <Form.Control 
                                        type="text" name="website" required
                                        value={editInst.website} onChange={handleEditInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={editInst.status} onChange={handleEditInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Add Department Modal */}
            <Modal show={showDeptModal} onHide={() => setShowDeptModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Register New Department</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddDepartment}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="departmentName" required
                                        value={newDept.departmentName} onChange={handleDeptInputChange}
                                        placeholder="e.g. Computer Science"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department Code</Form.Label>
                                    <Form.Control 
                                        type="text" name="departmentCode" required
                                        value={newDept.departmentCode} onChange={handleDeptInputChange}
                                        placeholder="e.g. CS"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Parent Institution</Form.Label>
                                    <Form.Select 
                                        name="institutionId" required
                                        value={newDept.institution.institutionId} onChange={handleDeptInputChange}
                                    >
                                        <option value="">-- Select Institution --</option>
                                        {institutions.map(inst => (
                                            <option key={inst.institutionId} value={inst.institutionId}>
                                                {inst.institutionName} ({inst.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>HOD Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="hodName" required
                                        value={newDept.hodName} onChange={handleDeptInputChange}
                                        placeholder="e.g. Dr. John Doe"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control 
                                        type="email" name="contactEmail" required
                                        value={newDept.contactEmail} onChange={handleDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Phone</Form.Label>
                                    <Form.Control 
                                        type="text" name="contactPhone" required
                                        value={newDept.contactPhone} onChange={handleDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={newDept.status} onChange={handleDeptInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDeptModal(false)}>Cancel</Button>
                        <Button type="submit" variant="success">Register Department</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Department Modal */}
            <Modal show={showEditDeptModal} onHide={() => setShowEditDeptModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modify Department Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditDepartment}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="departmentName" required
                                        value={editDept.departmentName} onChange={handleEditDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Department Code</Form.Label>
                                    <Form.Control 
                                        type="text" name="departmentCode" required
                                        value={editDept.departmentCode} onChange={handleEditDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Parent Institution</Form.Label>
                                    <Form.Select 
                                        name="institutionId" required
                                        value={editDept.institution.institutionId} onChange={handleEditDeptInputChange}
                                    >
                                        <option value="">-- Select Institution --</option>
                                        {institutions.map(inst => (
                                            <option key={inst.institutionId} value={inst.institutionId}>
                                                {inst.institutionName} ({inst.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>HOD Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="hodName" required
                                        value={editDept.hodName} onChange={handleEditDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Email</Form.Label>
                                    <Form.Control 
                                        type="email" name="contactEmail" required
                                        value={editDept.contactEmail} onChange={handleEditDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Contact Phone</Form.Label>
                                    <Form.Control 
                                        type="text" name="contactPhone" required
                                        value={editDept.contactPhone} onChange={handleEditDeptInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select name="status" value={editDept.status} onChange={handleEditDeptInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditDeptModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Add Laboratory Modal */}
            <Modal show={showLabModal} onHide={() => setShowLabModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Register New Laboratory</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddLab}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Laboratory Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="labName" required placeholder="e.g. Concrete Technology Lab"
                                        value={newLab.labName} onChange={handleLabInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Parent Department</Form.Label>
                                    <Form.Select 
                                        name="departmentId" required
                                        value={newLab.department.departmentId} onChange={handleLabInputChange}
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName} ({d.institution?.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="description" placeholder="Provide laboratory objective and location details..."
                                        value={newLab.description} onChange={handleLabInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLabModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Add Laboratory</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Laboratory Modal */}
            <Modal show={showEditLabModal} onHide={() => setShowEditLabModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modify Laboratory Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditLabSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Laboratory Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="labName" required
                                        value={editLab.labName} onChange={handleEditLabInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Parent Department</Form.Label>
                                    <Form.Select 
                                        name="departmentId" required
                                        value={editLab.department.departmentId} onChange={handleEditLabInputChange}
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName} ({d.institution?.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="description"
                                        value={editLab.description} onChange={handleEditLabInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditLabModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Add Equipment Modal */}
            <Modal show={showEquipModal} onHide={() => setShowEquipModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Register New Equipment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddEquip}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Equipment Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="equipmentName" required placeholder="e.g. Universal Testing Machine"
                                        value={newEquip.equipmentName} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control 
                                        type="text" name="category" required placeholder="e.g. Civil Engineering"
                                        value={newEquip.category} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select 
                                        name="status" value={newEquip.status} onChange={handleEquipInputChange}
                                    >
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Assign Department</Form.Label>
                                    <Form.Select 
                                        value={newEquip.departmentId || ""} 
                                        onChange={(e) => {
                                            setNewEquip(prev => ({
                                                ...prev,
                                                departmentId: e.target.value,
                                                laboratory: { labId: "" }
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName} ({d.institution?.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Assign Laboratory</Form.Label>
                                    <Form.Select 
                                        name="labId" required
                                        value={newEquip.laboratory.labId || ""} onChange={handleEquipInputChange}
                                        disabled={!newEquip.departmentId}
                                    >
                                        <option value="">-- Select Laboratory --</option>
                                        {laboratories.filter(l => l.department?.departmentId.toString() === newEquip.departmentId?.toString()).map(l => (
                                            <option key={l.labId} value={l.labId}>
                                                {l.labName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Manufacturer</Form.Label>
                                    <Form.Control 
                                        type="text" name="manufacturer" required placeholder="e.g. MTS Systems"
                                        value={newEquip.manufacturer} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Model Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="model" required placeholder="e.g. MTS-810"
                                        value={newEquip.model} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="serialNumber" required placeholder="e.g. SN-987234"
                                        value={newEquip.serialNumber} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Total Quantity</Form.Label>
                                    <Form.Control 
                                        type="number" name="totalQuantity" required min={1}
                                        value={newEquip.totalQuantity} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Cost Per Hour ($)</Form.Label>
                                    <Form.Control 
                                        type="number" step="0.01" name="costPerHour" required min={0}
                                        value={newEquip.costPerHour} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Purchase Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="purchaseDate"
                                        value={newEquip.purchaseDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Warranty Expiry</Form.Label>
                                    <Form.Control 
                                        type="date" name="warrantyExpiryDate"
                                        value={newEquip.warrantyExpiryDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Image File Upload</Form.Label>
                                    <Form.Control 
                                        type="file" accept="image/*"
                                        onChange={(e) => handleImageUpload(e, false)}
                                        disabled={uploadingFile}
                                    />
                                    {uploadingFile && <span className="text-muted small">Uploading image...</span>}
                                    {newEquip.imageUrl && (
                                        <div className="mt-2 text-success small">
                                            Selected: {newEquip.imageUrl}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Documentation PDF URL</Form.Label>
                                    <Form.Control 
                                        type="text" name="documentUrl" placeholder="https://example.com/manual.pdf"
                                        value={newEquip.documentUrl} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Equipment Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="description" placeholder="Summary of equipment usage..."
                                        value={newEquip.description} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Technical Specifications</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="specifications" placeholder="List key parameters..."
                                        value={newEquip.specifications} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <h6 className="fw-bold mt-3 border-bottom pb-2 text-primary">Calibration Management</h6>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Calibration Frequency</Form.Label>
                                    <Form.Select 
                                        name="calibrationFrequency"
                                        value={newEquip.calibrationFrequency} onChange={handleEquipInputChange}
                                    >
                                        <option value="Every 3 Months">Every 3 Months</option>
                                        <option value="Every 6 Months">Every 6 Months</option>
                                        <option value="Every 12 Months">Every 12 Months</option>
                                        <option value="Custom Date">Custom Date</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Last Calibration Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="lastCalibrationDate"
                                        value={newEquip.lastCalibrationDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Next Calibration Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="nextCalibrationDate"
                                        value={newEquip.nextCalibrationDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Calibration Status</Form.Label>
                                    <Form.Select 
                                        name="calibrationStatus"
                                        value={newEquip.calibrationStatus} onChange={handleEquipInputChange}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Due Soon">Due Soon</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Completed">Completed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <h6 className="fw-bold mt-3 border-bottom pb-2 text-primary">License & Compliance Management</h6>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="licenseNumber" placeholder="e.g. LIC-9834821"
                                        value={newEquip.licenseNumber} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Issue Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseIssueDate"
                                        value={newEquip.licenseIssueDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Expiry Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseExpiryDate"
                                        value={newEquip.licenseExpiryDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Renewal Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseRenewalDate"
                                        value={newEquip.licenseRenewalDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="certificateNumber" placeholder="e.g. CERT-2983719"
                                        value={newEquip.certificateNumber} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Issue Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateIssueDate"
                                        value={newEquip.certificateIssueDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Expiry Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateExpiryDate"
                                        value={newEquip.certificateExpiryDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Renewal Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateRenewalDate"
                                        value={newEquip.certificateRenewalDate} onChange={handleEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEquipModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={uploadingFile}>
                            {uploadingFile ? "Uploading..." : "Add Equipment"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Equipment Modal */}
            <Modal show={showEditEquipModal} onHide={() => setShowEditEquipModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Modify Equipment Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditEquipSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Equipment Name</Form.Label>
                                    <Form.Control 
                                        type="text" name="equipmentName" required
                                        value={editEquip.equipmentName} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control 
                                        type="text" name="category" required
                                        value={editEquip.category} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select 
                                        name="status" value={editEquip.status} onChange={handleEditEquipInputChange}
                                    >
                                        <option value="AVAILABLE">AVAILABLE</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE</option>
                                        <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Assign Department</Form.Label>
                                    <Form.Select 
                                        value={editEquip.departmentId || ""} 
                                        onChange={(e) => {
                                            setEditEquip(prev => ({
                                                ...prev,
                                                departmentId: e.target.value,
                                                laboratory: { labId: "" }
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="">-- Select Department --</option>
                                        {departments.map(d => (
                                            <option key={d.departmentId} value={d.departmentId}>
                                                {d.departmentName} ({d.institution?.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Assign Laboratory</Form.Label>
                                    <Form.Select 
                                        name="labId" required
                                        value={editEquip.laboratory.labId || ""} onChange={handleEditEquipInputChange}
                                        disabled={!editEquip.departmentId}
                                    >
                                        <option value="">-- Select Laboratory --</option>
                                        {laboratories.filter(l => l.department?.departmentId.toString() === editEquip.departmentId?.toString()).map(l => (
                                            <option key={l.labId} value={l.labId}>
                                                {l.labName}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Manufacturer</Form.Label>
                                    <Form.Control 
                                        type="text" name="manufacturer" required
                                        value={editEquip.manufacturer} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Model Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="model" required
                                        value={editEquip.model} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Serial Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="serialNumber" required
                                        value={editEquip.serialNumber} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Total Quantity</Form.Label>
                                    <Form.Control 
                                        type="number" name="totalQuantity" required min={1}
                                        value={editEquip.totalQuantity} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Available Quantity</Form.Label>
                                    <Form.Control 
                                        type="number" name="availableQuantity" required min={0}
                                        value={editEquip.availableQuantity} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Cost Per Hour ($)</Form.Label>
                                    <Form.Control 
                                        type="number" step="0.01" name="costPerHour" required min={0}
                                        value={editEquip.costPerHour} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Purchase Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="purchaseDate"
                                        value={editEquip.purchaseDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Warranty Expiry</Form.Label>
                                    <Form.Control 
                                        type="date" name="warrantyExpiryDate"
                                        value={editEquip.warrantyExpiryDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label>Image File Upload</Form.Label>
                                    <Form.Control 
                                        type="file" accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)}
                                        disabled={uploadingFile}
                                    />
                                    {uploadingFile && <span className="text-muted small">Uploading image...</span>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Image URL / Path</Form.Label>
                                    <Form.Control 
                                        type="text" name="imageUrl" placeholder="/images/equipment/custom.jpg"
                                        value={editEquip.imageUrl} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Documentation URL</Form.Label>
                                    <Form.Control 
                                        type="text" name="documentUrl"
                                        value={editEquip.documentUrl} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Equipment Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="description"
                                        value={editEquip.description} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Technical Specifications</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} name="specifications"
                                        value={editEquip.specifications} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <h6 className="fw-bold mt-3 border-bottom pb-2 text-primary">Calibration Management</h6>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Calibration Frequency</Form.Label>
                                    <Form.Select 
                                        name="calibrationFrequency"
                                        value={editEquip.calibrationFrequency} onChange={handleEditEquipInputChange}
                                    >
                                        <option value="Every 3 Months">Every 3 Months</option>
                                        <option value="Every 6 Months">Every 6 Months</option>
                                        <option value="Every 12 Months">Every 12 Months</option>
                                        <option value="Custom Date">Custom Date</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Last Calibration Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="lastCalibrationDate"
                                        value={editEquip.lastCalibrationDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Next Calibration Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="nextCalibrationDate"
                                        value={editEquip.nextCalibrationDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Calibration Status</Form.Label>
                                    <Form.Select 
                                        name="calibrationStatus"
                                        value={editEquip.calibrationStatus} onChange={handleEditEquipInputChange}
                                    >
                                        <option value="Scheduled">Scheduled</option>
                                        <option value="Due Soon">Due Soon</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Completed">Completed</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={12}>
                                <h6 className="fw-bold mt-3 border-bottom pb-2 text-primary">License & Compliance Management</h6>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="licenseNumber" placeholder="e.g. LIC-9834821"
                                        value={editEquip.licenseNumber} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Issue Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseIssueDate"
                                        value={editEquip.licenseIssueDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Expiry Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseExpiryDate"
                                        value={editEquip.licenseExpiryDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>License Renewal Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="licenseRenewalDate"
                                        value={editEquip.licenseRenewalDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Number</Form.Label>
                                    <Form.Control 
                                        type="text" name="certificateNumber" placeholder="e.g. CERT-2983719"
                                        value={editEquip.certificateNumber} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Issue Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateIssueDate"
                                        value={editEquip.certificateIssueDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Expiry Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateExpiryDate"
                                        value={editEquip.certificateExpiryDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Certificate Renewal Date</Form.Label>
                                    <Form.Control 
                                        type="date" name="certificateRenewalDate"
                                        value={editEquip.certificateRenewalDate} onChange={handleEditEquipInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditEquipModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={uploadingFile}>
                            {uploadingFile ? "Uploading..." : "Save Changes"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            <ConfirmationModal
                show={showConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.action}
                onCancel={() => setShowConfirm(false)}
            />
        </DashboardLayout>
    );
}

export default SystemAdminDashboard;
