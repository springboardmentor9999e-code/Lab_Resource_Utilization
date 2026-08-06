import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button, Modal, Form, Nav, Row, Col } from "react-bootstrap";
import { FaTools, FaCheck, FaSpinner, FaCalendarPlus, FaUserCheck, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";
import ConfirmationModal from "../common/ConfirmationModal";

function Maintenance() {
    // Shared state
    const [activeTab, setActiveTab] = useState("issues");
    const [issues, setIssues] = useState([]);
    const [preventives, setPreventives] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);

    // Roles and profiles
    const role = localStorage.getItem("role");

    // Modal state for resolving issues
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [resolutionDetails, setResolutionDetails] = useState("");

    // Modal state for assigning issues
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssignIssue, setSelectedAssignIssue] = useState(null);
    const [selectedTechId, setSelectedTechId] = useState("");

    // Modal state for scheduling preventive maintenance
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        equipmentId: "",
        scheduledDate: "",
        description: ""
    });

    // Modal state for completing preventive maintenance
    const [showCompletePmModal, setShowCompletePmModal] = useState(false);
    const [selectedPm, setSelectedPm] = useState(null);
    const [pmRemarks, setPmRemarks] = useState("");

    // Modal state for editing compliance details
    const [showEditComplianceModal, setShowEditComplianceModal] = useState(false);
    const [complianceEditForm, setComplianceEditForm] = useState({
        equipmentId: null,
        type: "", // CALIBRATION, LICENSE, CERTIFICATE
        dueDate: "",
        frequency: ""
    });

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Load reported issues
            const issuesRes = await axios.get("http://localhost:8080/api/issues", { headers });
            const sortedIssues = issuesRes.data.sort((a, b) => {
                if (a.status === "PENDING" && b.status !== "PENDING") return -1;
                if (a.status !== "PENDING" && b.status === "PENDING") return 1;
                if (a.status === "IN_PROGRESS" && b.status === "RESOLVED") return -1;
                if (a.status === "RESOLVED" && b.status === "IN_PROGRESS") return 1;
                return b.reportId - a.reportId;
            });
            setIssues(sortedIssues);

            // 2. Load preventive schedules (Students and Researchers do not see PMs)
            if (!["STUDENT", "RESEARCHER"].includes(role)) {
                const pmRes = await axios.get("http://localhost:8080/api/preventive", { headers });
                setPreventives(pmRes.data.sort((a, b) => b.id - a.id));
            }

            // 3. Load equipment for compliance checking and technician loading
            const equipRes = await axios.get("http://localhost:8080/api/equipment", { headers });
            setEquipments(equipRes.data);

            if (role === "LAB_MANAGER") {
                // Fetch technicians to assign tasks
                const usersRes = await axios.get("http://localhost:8080/api/admin/users", { headers });
                const techs = usersRes.data.filter(u => u.role?.roleName === "LAB_TECHNICIAN");
                setTechnicians(techs);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error loading maintenance data", error);
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
        const intervalId = setInterval(loadData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Workflow actions for Lab Technicians
    const handleStartWork = async (issueId) => {
        triggerConfirm("Start Maintenance Work", "Are you sure you want to start work on this maintenance task?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.put(`http://localhost:8080/api/issues/${issueId}/resolve`, { status: "IN_PROGRESS" }, { headers });
                alert("Maintenance work started.");
                loadData();
            } catch (error) {
                console.error("Error starting work", error);
                alert("Failed to start maintenance work.");
            }
        });
    };

    const openResolveModal = (issue) => {
        setSelectedIssue(issue);
        setResolutionDetails("");
        setShowResolveModal(true);
    };

    const handleResolveSubmit = async (e) => {
        e.preventDefault();
        if (!resolutionDetails.trim()) {
            alert("Please enter resolution details.");
            return;
        }
        triggerConfirm("Resolve Issue", "Are you sure you want to resolve this issue and return the equipment to service?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.put(`http://localhost:8080/api/issues/${selectedIssue.reportId}/resolve`, {
                    status: "RESOLVED",
                    resolutionDetails: resolutionDetails
                }, { headers });
                alert("Issue successfully resolved and equipment returned to Available status.");
                setShowResolveModal(false);
                loadData();
            } catch (error) {
                console.error("Error resolving issue", error);
                alert("Failed to resolve issue.");
            }
        });
    };

    // Assignment actions for Lab Managers
    const openAssignModal = (issue) => {
        setSelectedAssignIssue(issue);
        setSelectedTechId("");
        setShowAssignModal(true);
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTechId) {
            alert("Please select a technician.");
            return;
        }
        triggerConfirm("Assign Technician", "Are you sure you want to assign this task to the selected technician?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.put(`http://localhost:8080/api/issues/${selectedAssignIssue.reportId}/assign`, {
                    technicianUserId: selectedTechId
                }, { headers });
                alert("Technician assigned successfully.");
                setShowAssignModal(false);
                loadData();
            } catch (error) {
                console.error("Error assigning task", error);
                alert("Failed to assign technician.");
            }
        });
    };

    // Schedule actions for Lab Managers
    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        if (!newSchedule.equipmentId || !newSchedule.scheduledDate || !newSchedule.description.trim()) {
            alert("Please fill in all scheduling fields.");
            return;
        }
        triggerConfirm("Schedule PM", "Are you sure you want to schedule this preventive maintenance?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post("http://localhost:8080/api/preventive", newSchedule, { headers });
                alert("Preventive maintenance scheduled successfully.");
                setShowScheduleModal(false);
                setNewSchedule({ equipmentId: "", scheduledDate: "", description: "" });
                loadData();
            } catch (error) {
                console.error("Error scheduling PM", error);
                alert("Failed to schedule maintenance.");
            }
        });
    };

    // Preventive actions for Lab Technicians
    const openCompletePmModal = (pm) => {
        setSelectedPm(pm);
        setPmRemarks("");
        setShowCompletePmModal(true);
    };

    const handleCompletePmSubmit = async (e) => {
        e.preventDefault();
        if (!pmRemarks.trim()) {
            alert("Please enter completion remarks.");
            return;
        }
        triggerConfirm("Complete PM Task", "Are you sure you want to complete this preventive maintenance task?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.put(`http://localhost:8080/api/preventive/${selectedPm.id}`, {
                    status: "COMPLETED",
                    remarks: pmRemarks
                }, { headers });
                alert("Preventive maintenance marked as Completed.");
                setShowCompletePmModal(false);
                loadData();
            } catch (error) {
                console.error("Error completing PM", error);
                alert("Failed to complete preventive maintenance.");
            }
        });
    };

    const handleCompleteCalibration = async (equipId) => {
        triggerConfirm("Complete Calibration", "Are you sure you want to mark this equipment's calibration as completed?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post(`http://localhost:8080/api/equipment/${equipId}/calibration/complete`, {}, { headers });
                alert("Calibration marked as completed successfully. Dates have been updated.");
                loadData();
            } catch (error) {
                console.error("Error completing calibration", error);
                alert("Failed to complete calibration.");
            }
        });
    };



    const handleRenewLicense = async (equipId) => {
        triggerConfirm("Renew License", "Are you sure you want to renew this equipment's license?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post(`http://localhost:8080/api/equipment/${equipId}/license/renew`, {}, { headers });
                alert("License marked as renewed successfully. Expiration date has been updated.");
                loadData();
            } catch (error) {
                console.error("Error renewing license", error);
                alert("Failed to renew license.");
            }
        });
    };

    const handleRenewCertificate = async (equipId) => {
        triggerConfirm("Renew Certificate", "Are you sure you want to renew this equipment's certificate?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                await axios.post(`http://localhost:8080/api/equipment/${equipId}/certificate/renew`, {}, { headers });
                alert("Certificate marked as renewed successfully. Expiration date has been updated.");
                loadData();
            } catch (error) {
                console.error("Error renewing certificate", error);
                alert("Failed to renew certificate.");
            }
        });
    };

    const openEditComplianceModal = (eq, type) => {
        let dueDate = "";
        let frequency = "";
        if (type === "CALIBRATION") {
            dueDate = eq.nextCalibrationDate || "";
            frequency = eq.calibrationFrequency || "Every 3 Months";
        } else if (type === "LICENSE") {
            dueDate = eq.licenseRenewalDate || "";
            frequency = eq.licenseRenewalFrequency || "Every 6 Months";
        } else if (type === "CERTIFICATE") {
            dueDate = eq.certificateRenewalDate || "";
            frequency = eq.certificateRenewalFrequency || "Every 6 Months";
        }
        setComplianceEditForm({
            equipmentId: eq.id,
            type,
            dueDate,
            frequency
        });
        setShowEditComplianceModal(true);
    };

    const handleComplianceEditSubmit = async (e) => {
        e.preventDefault();
        triggerConfirm("Update Compliance Details", "Are you sure you want to update these compliance scheduling details?", async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                
                const equipRes = await axios.get(`http://localhost:8080/api/equipment/${complianceEditForm.equipmentId}`, { headers });
                const eq = equipRes.data;
                
                if (complianceEditForm.type === "CALIBRATION") {
                    eq.nextCalibrationDate = complianceEditForm.dueDate;
                    eq.calibrationFrequency = complianceEditForm.frequency;
                    eq.calibrationStatus = "Scheduled";
                } else if (complianceEditForm.type === "LICENSE") {
                    eq.licenseRenewalDate = complianceEditForm.dueDate;
                    eq.licenseRenewalFrequency = complianceEditForm.frequency;
                    eq.licenseStatus = "Active";
                } else if (complianceEditForm.type === "CERTIFICATE") {
                    eq.certificateRenewalDate = complianceEditForm.dueDate;
                    eq.certificateRenewalFrequency = complianceEditForm.frequency;
                    eq.certificateStatus = "Active";
                }
                
                await axios.put(`http://localhost:8080/api/equipment/${complianceEditForm.equipmentId}`, eq, { headers });
                alert("Compliance schedule updated successfully.");
                setShowEditComplianceModal(false);
                loadData();
            } catch (err) {
                console.error("Error updating compliance", err);
                alert("Failed to update compliance details.");
            }
        });
    };

    const getCalibrationStatusBadge = (status) => {
        switch (status) {
            case "Completed":
                return <Badge bg="success">Completed</Badge>;
            case "Due Soon":
                return <Badge bg="warning" text="dark">Due Soon</Badge>;
            case "Overdue":
                return <Badge bg="danger">Overdue</Badge>;
            default:
                return <Badge bg="primary">Scheduled</Badge>;
        }
    };

    const getComplianceStatusBadge = (status) => {
        switch (status) {
            case "Active":
            case "Renewed":
                return <Badge bg="success">{status}</Badge>;
            case "Due Soon":
                return <Badge bg="warning" text="dark">Due Soon</Badge>;
            case "Expired":
                return <Badge bg="danger">Expired</Badge>;
            default:
                return <Badge bg="primary">Active</Badge>;
        }
    };

    const getLicenseStatus = (eq) => {
        if (eq.licenseStatus === "Renewed") return "Renewed";
        if (!eq.licenseExpiryDate) return "Active";
        const exp = new Date(eq.licenseExpiryDate);
        const today = new Date();
        if (exp < today) return "Expired";
        
        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) return "Due Soon";
        
        return "Active";
    };

    const getCertificateStatus = (eq) => {
        if (eq.certificateStatus === "Renewed") return "Renewed";
        if (!eq.certificateExpiryDate) return "Active";
        const exp = new Date(eq.certificateExpiryDate);
        const today = new Date();
        if (exp < today) return "Expired";
        
        const diffTime = exp.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) return "Due Soon";
        
        return "Active";
    };

    // Badges helper
    const getStatusBadge = (status) => {
        if ("RESOLVED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            return <Badge bg="success">Completed / Resolved</Badge>;
        }
        if ("IN_PROGRESS".equalsIgnoreCase(status)) {
            return <Badge bg="warning" text="dark">In Progress</Badge>;
        }
        return <Badge bg="danger">Pending / Scheduled</Badge>;
    };

    return (
        <DashboardLayout title="Equipment Maintenance Workspace">
            <Container fluid className="px-0">
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            Secure equipment health and log reported issues. Technicians resolve maintenance jobs, Managers assign and schedule tasks, and Admins/Heads inspect reports.
                        </p>
                    </Card.Body>
                </Card>

                {/* Tab layout toggling between Issues, PM, Calibration, and Renewals */}
                <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                    <Nav.Item>
                        <Nav.Link eventKey="issues"><FaTools className="me-2" /> Reported Issues</Nav.Link>
                    </Nav.Item>
                    {!["STUDENT", "RESEARCHER"].includes(role) && (
                        <>
                            <Nav.Item>
                                <Nav.Link eventKey="preventive"><FaClipboardList className="me-2" /> Preventive Maintenance Schedules</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="calibration"><FaClipboardList className="me-2" /> Calibration Tests</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="renewals"><FaClipboardList className="me-2" /> License & Certificate Renewal</Nav.Link>
                            </Nav.Item>
                        </>
                    )}
                </Nav>

                {activeTab === "issues" ? (
                    <Card className="shadow border-0">
                        <Card.Body className="p-0">
                            {loading ? (
                                <h5 className="text-center text-muted py-5">Loading maintenance logs...</h5>
                            ) : issues.length === 0 ? (
                                <div className="text-center py-5 text-muted">
                                    <FaTools size={50} className="mb-3" />
                                    <h5>No Issue Reports Registered</h5>
                                </div>
                            ) : (
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Equipment Details</th>
                                            <th>Reported By</th>
                                            <th>Issue Description</th>
                                            <th>Assigned To</th>
                                            <th>Date Reported</th>
                                            <th>Status</th>
                                            {["LAB_TECHNICIAN", "LAB_MANAGER"].includes(role) && <th className="text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {issues.map((item) => (
                                            <tr key={item.reportId}>
                                                <td>
                                                    <strong>{item.equipment?.equipmentName}</strong>
                                                    <br />
                                                    <small className="text-muted">Serial: {item.equipment?.serialNumber}</small>
                                                </td>
                                                <td>
                                                    <strong>{item.reportedBy?.fullName}</strong>
                                                    <br />
                                                    <small className="text-muted">{item.reportedBy?.email}</small>
                                                </td>
                                                <td>
                                                    <div style={{ maxWidth: "300px", whiteSpace: "pre-wrap" }}>
                                                        {item.description}
                                                    </div>
                                                    {item.resolutionDetails && (
                                                        <div className="mt-2 text-success small">
                                                            <strong>Fix:</strong> {item.resolutionDetails}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.assignedTo ? (
                                                        <Badge bg="info" className="p-2 text-dark">
                                                            {item.assignedTo.fullName}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted small">Unassigned</span>
                                                    )}
                                                </td>
                                                <td>{item.reportedDate}</td>
                                                <td>
                                                    {getStatusBadge(item.status)}
                                                    {item.resolvedDate && (
                                                        <div className="small text-muted mt-1">Resolved: {item.resolvedDate}</div>
                                                    )}
                                                </td>
                                                {/* Role-based action buttons */}
                                                {role === "LAB_TECHNICIAN" && (
                                                    <td className="text-center">
                                                        {item.status === "PENDING" && (
                                                            <div className="d-flex gap-2 justify-content-center">
                                                                <Button variant="warning" size="sm" onClick={() => handleStartWork(item.reportId)}>
                                                                    <FaSpinner className="me-1" /> Start Work
                                                                </Button>
                                                                <Button variant="success" size="sm" onClick={() => openResolveModal(item)}>
                                                                    <FaCheck className="me-1" /> Resolve
                                                                </Button>
                                                            </div>
                                                        )}
                                                        {item.status === "IN_PROGRESS" && (
                                                            <Button variant="success" size="sm" onClick={() => openResolveModal(item)}>
                                                                <FaCheck className="me-1" /> Resolve
                                                            </Button>
                                                        )}
                                                        {"RESOLVED".equalsIgnoreCase(item.status) && (
                                                            <span className="text-muted small">Completed</span>
                                                        )}
                                                    </td>
                                                )}
                                                {role === "LAB_MANAGER" && (
                                                    <td className="text-center">
                                                        {item.status === "PENDING" && !item.assignedTo && (
                                                            <Button variant="outline-primary" size="sm" onClick={() => openAssignModal(item)}>
                                                                <FaUserCheck className="me-1" /> Assign Task
                                                            </Button>
                                                        )}
                                                        {item.status === "PENDING" && item.assignedTo && (
                                                            <span className="text-muted small">Assigned</span>
                                                        )}
                                                        {item.status === "IN_PROGRESS" && (
                                                            <span className="text-warning small fw-bold">In Progress</span>
                                                        )}
                                                        {"RESOLVED".equalsIgnoreCase(item.status) && (
                                                            <span className="text-muted small">Completed</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                ) : activeTab === "preventive" ? (
                    // Preventive Maintenance Tab
                    <Card className="shadow border-0">
                        {role === "LAB_MANAGER" && (
                            <Card.Header className="bg-white py-3 border-0 d-flex justify-content-end">
                                <Button variant="primary" onClick={() => setShowScheduleModal(true)}>
                                    <FaCalendarPlus className="me-2" /> Schedule Preventive Maintenance
                                </Button>
                            </Card.Header>
                        )}
                        <Card.Body className="p-0">
                            {preventives.length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No preventive maintenance tasks scheduled.</p>
                            ) : (
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Equipment Details</th>
                                            <th>Target Schedule Date</th>
                                            <th>Activity Description</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                            {role === "LAB_TECHNICIAN" && <th className="text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preventives.map((pm) => (
                                            <tr key={pm.id}>
                                                <td>
                                                    <strong>{pm.equipment?.equipmentName}</strong>
                                                    <br />
                                                    <small className="text-muted">Serial: {pm.equipment?.serialNumber}</small>
                                                </td>
                                                <td>{pm.scheduledDate}</td>
                                                <td>{pm.description}</td>
                                                <td>{getStatusBadge(pm.status)}</td>
                                                <td>{pm.remarks || <span className="text-muted small">None</span>}</td>
                                                {role === "LAB_TECHNICIAN" && (
                                                    <td className="text-center">
                                                        {pm.status === "SCHEDULED" ? (
                                                            <Button variant="success" size="sm" onClick={() => openCompletePmModal(pm)}>
                                                                <FaCheck className="me-1" /> Mark Completed
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted small">Completed</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                ) : activeTab === "calibration" ? (
                    // Calibration Tests Tab
                    <Card className="shadow border-0">
                        <Card.Body className="p-0">
                            {equipments.filter(e => e.nextCalibrationDate).length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No calibration tests scheduled.</p>
                            ) : (
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Equipment Name</th>
                                            <th>Maintenance Type</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th>Assigned Technician</th>
                                            {!["DEPARTMENT_HEAD"].includes(role) && <th className="text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {equipments.filter(e => e.nextCalibrationDate).map((eq) => (
                                            <tr key={eq.id}>
                                                <td>
                                                    <strong>{eq.equipmentName}</strong>
                                                    <br />
                                                    <small className="text-muted">Serial: {eq.serialNumber}</small>
                                                </td>
                                                <td>Calibration Test</td>
                                                <td>{eq.nextCalibrationDate}</td>
                                                <td>{getCalibrationStatusBadge(eq.calibrationStatus)}</td>
                                                <td>Lab Technician</td>
                                                {!["DEPARTMENT_HEAD"].includes(role) && (
                                                    <td className="text-center">
                                                        {role === "LAB_TECHNICIAN" && eq.calibrationStatus !== "Completed" && (
                                                            <Button 
                                                                variant="success" 
                                                                size="sm" 
                                                                onClick={() => handleCompleteCalibration(eq.id)}
                                                            >
                                                                <FaCheck className="me-1" /> Complete Calibration
                                                            </Button>
                                                        )}
                                                        {["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"].includes(role) && (
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm" 
                                                                onClick={() => openEditComplianceModal(eq, "CALIBRATION")}
                                                            >
                                                                Edit Details
                                                            </Button>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                ) : (
                    // License & Certificate Renewal Tab
                    <Card className="shadow border-0">
                        <Card.Body className="p-0">
                            {equipments.filter(e => e.licenseRenewalDate || e.certificateRenewalDate).length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No license or certificate renewals scheduled.</p>
                            ) : (
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Equipment Name</th>
                                            <th>Maintenance Type</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th>Assigned Technician</th>
                                            {!["DEPARTMENT_HEAD"].includes(role) && <th className="text-center">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Render License Renewals */}
                                        {equipments.filter(e => e.licenseRenewalDate).map((eq) => {
                                            const status = getLicenseStatus(eq);
                                            return (
                                                <tr key={`lic-${eq.id}`}>
                                                    <td>
                                                        <strong>{eq.equipmentName}</strong>
                                                        <br />
                                                        <small className="text-muted">License: {eq.licenseNumber || "N/A"}</small>
                                                    </td>
                                                    <td>License Renewal</td>
                                                    <td>{eq.licenseRenewalDate}</td>
                                                    <td>{getComplianceStatusBadge(status)}</td>
                                                    <td>Institution Admin</td>
                                                    {!["DEPARTMENT_HEAD"].includes(role) && (
                                                        <td className="text-center">
                                                            {role === "LAB_TECHNICIAN" && status !== "Renewed" && (
                                                                <Button 
                                                                    variant="success" 
                                                                    size="sm" 
                                                                    onClick={() => handleRenewLicense(eq.id)}
                                                                >
                                                                    <FaCheck className="me-1" /> Mark Renewed
                                                                </Button>
                                                            )}
                                                            {["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"].includes(role) && (
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm" 
                                                                    onClick={() => openEditComplianceModal(eq, "LICENSE")}
                                                                >
                                                                    Edit Details
                                                                </Button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                        {/* Render Certificate Renewals */}
                                        {equipments.filter(e => e.certificateRenewalDate).map((eq) => {
                                            const status = getCertificateStatus(eq);
                                            return (
                                                <tr key={`cert-${eq.id}`}>
                                                    <td>
                                                        <strong>{eq.equipmentName}</strong>
                                                        <br />
                                                        <small className="text-muted">Certificate: {eq.certificateNumber || "N/A"}</small>
                                                    </td>
                                                    <td>Certificate Renewal</td>
                                                    <td>{eq.certificateRenewalDate}</td>
                                                    <td>{getComplianceStatusBadge(status)}</td>
                                                    <td>Lab Manager</td>
                                                    {!["DEPARTMENT_HEAD"].includes(role) && (
                                                        <td className="text-center">
                                                            {role === "LAB_TECHNICIAN" && status !== "Renewed" && (
                                                                <Button 
                                                                    variant="success" 
                                                                    size="sm" 
                                                                    onClick={() => handleRenewCertificate(eq.id)}
                                                                >
                                                                    <FaCheck className="me-1" /> Mark Renewed
                                                                </Button>
                                                            )}
                                                            {["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"].includes(role) && (
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm" 
                                                                    onClick={() => openEditComplianceModal(eq, "CERTIFICATE")}
                                                                >
                                                                    Edit Details
                                                                </Button>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </Container>

            {/* Resolve Modal */}
            <Modal show={showResolveModal} onHide={() => setShowResolveModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Resolve Equipment Issue</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleResolveSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Resolution Details / Remarks</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Describe what actions were taken to fix the equipment issue..."
                                value={resolutionDetails}
                                onChange={(e) => setResolutionDetails(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowResolveModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Submit Resolution</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Assign Modal */}
            <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Technician</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Department Lab Technician</Form.Label>
                            <Form.Select 
                                value={selectedTechId} 
                                onChange={(e) => setSelectedTechId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Lab Technician --</option>
                                {technicians.map(t => (
                                    <option key={t.userId} value={t.userId}>{t.fullName} ({t.email})</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Assign Task</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Schedule Preventive Maintenance Modal */}
            <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Preventive Maintenance</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleScheduleSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Select Equipment</Form.Label>
                                    <Form.Select 
                                        value={newSchedule.equipmentId}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, equipmentId: e.target.value }))}
                                        required
                                    >
                                        <option value="">-- Choose Equipment --</option>
                                        {equipments.map(eq => (
                                            <option key={eq.id} value={eq.id}>
                                                {eq.equipmentName} (Serial: {eq.serialNumber})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Target Schedule Date</Form.Label>
                                    <Form.Control 
                                        type="date" required
                                        value={newSchedule.scheduledDate}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, scheduledDate: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Activity Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={3} required
                                        placeholder="e.g. Periodic recalibration and cleaning of laser optics..."
                                        value={newSchedule.description}
                                        onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Schedule Activity</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Complete Preventive Maintenance Modal */}
            <Modal show={showCompletePmModal} onHide={() => setShowCompletePmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Complete Preventive Maintenance</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCompletePmSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Activity Remarks & Details</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Describe findings, calibration levels, or parts replaced..."
                                value={pmRemarks}
                                onChange={(e) => setPmRemarks(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCompletePmModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Submit Remarks & Complete</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
            {/* Edit Compliance Details Modal */}
            <Modal show={showEditComplianceModal} onHide={() => setShowEditComplianceModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Update Compliance Schedule Details</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleComplianceEditSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Target Due Date / Deadline</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        value={complianceEditForm.dueDate}
                                        onChange={(e) => setComplianceEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label>Renewal / Recalibration Frequency</Form.Label>
                                    <Form.Select 
                                        value={complianceEditForm.frequency}
                                        onChange={(e) => setComplianceEditForm(prev => ({ ...prev, frequency: e.target.value }))}
                                        required
                                    >
                                        <option value="Every 3 Months">Every 3 Months</option>
                                        <option value="Every 6 Months">Every 6 Months</option>
                                        <option value="Every 12 Months">Every 12 Months</option>
                                        <option value="Custom Date">Custom Date</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditComplianceModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Changes</Button>
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

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default Maintenance;
