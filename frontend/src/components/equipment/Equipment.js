import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Badge,
    Modal
} from "react-bootstrap";
import { FaLaptop, FaCalendarAlt, FaBookOpen } from "react-icons/fa";
import axios from "axios";

import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";
import { getLaboratoriesByDepartment } from "../../services/laboratoryService";
import { getEquipmentByLaboratory } from "../../services/equipmentService";
import DashboardLayout from "../dashboard/DashboardLayout";
import BookEquipmentModal from "./BookEquipmentModal";

const Equipment = () => {
    const role = localStorage.getItem("role");
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);

    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedLaboratory, setSelectedLaboratory] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedEquip, setSelectedEquip] = useState(null);

    // Documentation Modal state
    const [showDocModal, setShowDocModal] = useState(false);
    const [docModalEquip, setDocModalEquip] = useState(null);

    // Report Issue Modal state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportEquip, setReportEquip] = useState(null);
    const [issueDescription, setIssueDescription] = useState("");

    // Track image loading errors
    const [imgErrors, setImgErrors] = useState({});

    useEffect(() => {
        loadInstitutions();
        loadBookings();
    }, []);

    const loadInstitutions = async () => {
        try {
            const response = await institutionService.getAllInstitutions();
            setInstitutions(response.data);
        } catch (error) {
            console.error("Error loading institutions:", error);
        }
    };

    const loadBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get("http://localhost:8080/api/bookings", { headers });
            setBookingsList(response.data);
        } catch (error) {
            console.error("Error loading bookings log:", error);
        }
    };

    const handleInstitutionChange = async (e) => {
        const id = e.target.value;
        setSelectedInstitution(id);
        setSelectedDepartment("");
        setSelectedLaboratory("");
        setDepartments([]);
        setLaboratories([]);
        setEquipment([]);

        if (!id) return;

        try {
            const response = await departmentService.getDepartmentsByInstitution(id);
            setDepartments(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDepartmentChange = async (e) => {
        const id = e.target.value;
        setSelectedDepartment(id);
        setSelectedLaboratory("");
        setLaboratories([]);
        setEquipment([]);

        if (!id) return;

        try {
            const response = await getLaboratoriesByDepartment(id);
            setLaboratories(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLaboratoryChange = async (e) => {
        const id = e.target.value;
        setSelectedLaboratory(id);

        if (!id) return;

        try {
            const response = await getEquipmentByLaboratory(id);
            setEquipment(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const openBookingModal = (item) => {
        setSelectedEquip(item);
        setShowModal(true);
    };

    const openDocModal = (item) => {
        setDocModalEquip(item);
        setShowDocModal(true);
    };

    const handleImgError = (id) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };

    const openReportModal = (item) => {
        setReportEquip(item);
        setIssueDescription("");
        setShowReportModal(true);
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!issueDescription.trim()) {
            alert("Please enter a description of the issue.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.post("http://localhost:8080/api/issues", {
                equipmentId: reportEquip.id,
                description: issueDescription
            }, { headers });
            alert("Issue successfully reported. Equipment status set to Under Maintenance.");
            setShowReportModal(false);
            if (selectedLaboratory) {
                handleLaboratoryChange({ target: { value: selectedLaboratory } });
            }
        } catch (error) {
            console.error("Error reporting issue", error);
            alert("Failed to submit issue report.");
        }
    };

    const getEquipmentCurrentStatus = (item) => {
        if ("Under Maintenance".equalsIgnoreCase(item.status) || 
            "Out of Service".equalsIgnoreCase(item.status) ||
            "Retired".equalsIgnoreCase(item.status)) {
            return item.status;
        }

        const now = new Date();
        const currentDateStr = now.getFullYear() + "-" + 
            String(now.getMonth() + 1).padStart(2, '0') + "-" + 
            String(now.getDate()).padStart(2, '0'); // YYYY-MM-DD
        const currentTimeStr = String(now.getHours()).padStart(2, '0') + ":" + 
            String(now.getMinutes()).padStart(2, '0'); // HH:MM

        // Find if there is an active booking running right now
        const activeBooking = bookingsList.find(b => 
            b.equipment?.id === item.id &&
            ("Approved".equalsIgnoreCase(b.status) || "Confirmed".equalsIgnoreCase(b.status) || "In Use".equalsIgnoreCase(b.status)) &&
            b.bookingDate === currentDateStr &&
            b.startTime <= currentTimeStr &&
            b.endTime >= currentTimeStr
        );

        if (activeBooking) {
            return "Booked";
        }
        return item.status || "Available";
    };

    const getStatusBadge = (status) => {
        if ("Available".equalsIgnoreCase(status)) return <Badge bg="success">Available</Badge>;
        if ("Booked".equalsIgnoreCase(status) || "Using".equalsIgnoreCase(status)) return <Badge bg="danger">Booked</Badge>;
        if ("Under Maintenance".equalsIgnoreCase(status)) return <Badge bg="warning" text="dark">Under Maintenance</Badge>;
        if ("Out of Service".equalsIgnoreCase(status)) return <Badge bg="dark">Out of Service</Badge>;
        if ("Retired".equalsIgnoreCase(status)) return <Badge bg="secondary">Retired</Badge>;
        return <Badge bg="info">{status}</Badge>;
    };

    return (
        <DashboardLayout title="Equipment Directory">
            <Container fluid className="px-0">
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Label className="text-muted small fw-bold">Institution</Form.Label>
                                <Form.Select
                                    value={selectedInstitution}
                                    onChange={handleInstitutionChange}
                                >
                                    <option value="">Select Institution</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.institutionId} value={inst.institutionId}>
                                            {inst.institutionName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label className="text-muted small fw-bold">Department</Form.Label>
                                <Form.Select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    disabled={!selectedInstitution}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dep) => (
                                        <option key={dep.departmentId} value={dep.departmentId}>
                                            {dep.departmentName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label className="text-muted small fw-bold">Laboratory</Form.Label>
                                <Form.Select
                                    value={selectedLaboratory}
                                    onChange={handleLaboratoryChange}
                                    disabled={!selectedDepartment}
                                >
                                    <option value="">Select Laboratory</option>
                                    {laboratories.map((lab) => (
                                        <option key={lab.labId} value={lab.labId}>
                                            {lab.labName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row className="g-4">
                    {equipment.length === 0 ? (
                        <Col>
                            <Card className="text-center p-5 border-0 bg-transparent shadow-none">
                                <FaLaptop size={55} className="text-muted mb-3 mx-auto" />
                                <h5>No Equipment Available</h5>
                                <p className="text-muted small">Please select an institution, department, and laboratory to browse devices.</p>
                            </Card>
                        </Col>
                    ) : (
                        equipment.map((item) => {
                            const currentStatus = getEquipmentCurrentStatus(item);
                            return (
                                <Col lg={4} md={6} key={item.id}>
                                    <Card className="shadow h-100">
                                        {item.imageUrl && !imgErrors[item.id] ? (
                                            <div className="text-center p-3 bg-light rounded-top d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.equipmentName} 
                                                    style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }}
                                                    onError={() => handleImgError(item.id)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center p-3 bg-light rounded-top d-flex align-items-center justify-content-center" style={{ height: "160px", color: "#94a3b8" }}>
                                                <FaLaptop size={60} />
                                            </div>
                                        )}
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div>
                                                <Card.Title className="fw-bold text-primary">{item.equipmentName}</Card.Title>
                                                <hr className="my-2" style={{ borderColor: "rgba(0,0,0,0.08)" }} />
                                                <Card.Text className="small text-muted mb-3">
                                                    <strong>Category:</strong> {item.category}
                                                    <br />
                                                    <strong>Manufacturer:</strong> {item.manufacturer} ({item.model})
                                                    <br />
                                                    <strong>Status:</strong>{" "}
                                                    {getStatusBadge(currentStatus)}
                                                    {item.description && (
                                                        <>
                                                            <br />
                                                            <strong>Documentation:</strong>{" "}
                                                            <Button 
                                                                variant="link" 
                                                                className="p-0 text-info fw-bold small align-baseline"
                                                                style={{ textDecoration: "none" }}
                                                                onClick={() => openDocModal(item)}
                                                            >
                                                                <FaBookOpen className="me-1" /> View datasheet & guide
                                                            </Button>
                                                        </>
                                                    )}
                                                </Card.Text>
                                            </div>
                                            <div className="d-flex flex-column gap-2 mt-3">
                                                <Button
                                                    variant="success"
                                                    className="w-100"
                                                    onClick={() => openBookingModal(item)}
                                                    disabled={"Under Maintenance".equalsIgnoreCase(currentStatus) || "Out of Service".equalsIgnoreCase(currentStatus) || "Retired".equalsIgnoreCase(currentStatus)}
                                                >
                                                    <FaCalendarAlt className="me-2" /> Book Now
                                                </Button>
                                                {("STUDENT".equalsIgnoreCase(role) || "RESEARCHER".equalsIgnoreCase(role)) && (
                                                    <Button
                                                        variant="outline-warning"
                                                        className="w-100"
                                                        onClick={() => openReportModal(item)}
                                                        disabled={"Retired".equalsIgnoreCase(currentStatus)}
                                                    >
                                                        Report Issue
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })
                    )}
                </Row>
            </Container>

            {/* Booking Modal */}
            <BookEquipmentModal
                show={showModal}
                handleClose={() => {
                    setShowModal(false);
                    loadBookings();
                    if (selectedLaboratory) {
                        handleLaboratoryChange({ target: { value: selectedLaboratory } });
                    }
                }}
                equipment={selectedEquip}
            />

            {/* Documentation Text & Image Modal */}
            <Modal show={showDocModal} onHide={() => setShowDocModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Equipment Specifications</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {docModalEquip?.imageUrl && !imgErrors[docModalEquip.id] ? (
                        <img 
                            src={docModalEquip.imageUrl} 
                            alt={docModalEquip.equipmentName} 
                            style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: "8px", marginBottom: "15px" }}
                            onError={() => handleImgError(docModalEquip.id)}
                        />
                    ) : (
                        <div className="text-muted mb-3"><FaLaptop size={80} /></div>
                    )}
                    <h5 className="fw-bold mb-2">{docModalEquip?.equipmentName}</h5>
                    <p className="text-muted small mb-3">Model: {docModalEquip?.model} | Manufacturer: {docModalEquip?.manufacturer}</p>
                    <div className="p-3 bg-light rounded text-start">
                        <h6 className="fw-bold small">Description:</h6>
                        <p className="mb-0 text-secondary small">
                            {docModalEquip?.description || "High-precision laboratory equipment designed for practical experimentation and advanced academic research purposes."}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDocModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
            {/* Report Issue Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Report Equipment Issue</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleReportSubmit}>
                    <Modal.Body>
                        <h6 className="fw-bold mb-3">Equipment: {reportEquip?.equipmentName}</h6>
                        <Form.Group className="mb-3">
                            <Form.Label>Description of Issue</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Describe the issue, malfunction, or error with the equipment in detail..."
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
                        <Button variant="warning" type="submit">Submit Report</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </DashboardLayout>
    );
};

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default Equipment;