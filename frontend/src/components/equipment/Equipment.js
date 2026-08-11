import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Badge,
    Modal,
    InputGroup
} from "react-bootstrap";
import { FaLaptop, FaCalendarAlt, FaBookOpen, FaFilter, FaEdit, FaSearch } from "react-icons/fa";
import axios from "axios";

import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";
import { getLaboratoriesByDepartment } from "../../services/laboratoryService";
import { getEquipmentByLaboratory } from "../../services/equipmentService";
import DashboardLayout from "../dashboard/DashboardLayout";
import BookEquipmentModal from "./BookEquipmentModal";

const Equipment = () => {
    const role = localStorage.getItem("role");
    const userInstId = localStorage.getItem("institutionId");

    const isSystemAdmin = role === "SYSTEM_ADMIN";
    const isInstAdmin = role === "INSTITUTION_ADMIN";
    const isAdmin = isSystemAdmin || isInstAdmin;
    const canEditRate = isSystemAdmin || isInstAdmin;

    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);

    const [selectedInstitution, setSelectedInstitution] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedLaboratory, setSelectedLaboratory] = useState("");
    const [ownershipFilter, setOwnershipFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [selectedEquip, setSelectedEquip] = useState(null);

    // Documentation Modal state
    const [showDocModal, setShowDocModal] = useState(false);
    const [docModalEquip, setDocModalEquip] = useState(null);

    // Report Issue Modal state
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportEquip, setReportEquip] = useState(null);
    const [issueDescription, setIssueDescription] = useState("");

    // Edit Cost Rate Modal state
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateEquip, setRateEquip] = useState(null);
    const [newRate, setNewRate] = useState(5.0);

    // Track image loading errors
    const [imgErrors, setImgErrors] = useState({});

    const refreshCurrentSelection = async () => {
        loadBookings();
        loadEquipmentData();
    };

    useEffect(() => {
        loadInstitutions();
        loadBookings();
        loadEquipmentData();
        const intervalId = setInterval(refreshCurrentSelection, 60000);
        return () => clearInterval(intervalId);
    }, [selectedLaboratory, selectedInstitution, ownershipFilter]);

    const loadInstitutions = async () => {
        try {
            const response = await institutionService.getAllInstitutions();
            setInstitutions(response.data || []);
        } catch (error) {
            console.error("Error loading institutions:", error);
        }
    };

    const loadBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get("http://localhost:8080/api/bookings", { headers });
            setBookingsList(response.data || []);
        } catch (error) {
            console.error("Error loading bookings log:", error);
        }
    };

    const loadEquipmentData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (selectedLaboratory) {
                const response = await getEquipmentByLaboratory(selectedLaboratory);
                setEquipment(response.data || []);
            } else {
                // Load user inventory (own + shared) or global view
                const url = `http://localhost:8080/api/equipment/user-inventory?ownership=${ownershipFilter}`;
                const response = await axios.get(url, { headers });
                setEquipment(response.data || []);
            }
        } catch (error) {
            console.error("Error loading equipment data:", error);
        }
    };

    const handleInstitutionChange = async (e) => {
        const id = e.target.value;
        setSelectedInstitution(id);
        setSelectedDepartment("");
        setSelectedLaboratory("");
        setDepartments([]);
        setLaboratories([]);

        if (!id) {
            loadEquipmentData();
            return;
        }

        try {
            const response = await departmentService.getDepartmentsByInstitution(id);
            setDepartments(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDepartmentChange = async (e) => {
        const id = e.target.value;
        setSelectedDepartment(id);
        setSelectedLaboratory("");
        setLaboratories([]);

        if (!id) return;

        try {
            const response = await getLaboratoriesByDepartment(id);
            setLaboratories(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLaboratoryChange = async (e) => {
        const id = e.target.value;
        setSelectedLaboratory(id);

        if (!id) {
            loadEquipmentData();
            return;
        }

        try {
            const response = await getEquipmentByLaboratory(id);
            setEquipment(response.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleImgError = (id) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };

    const openBookingModal = (equip) => {
        setSelectedEquip(equip);
        setShowModal(true);
    };

    const openDocModal = (equip) => {
        setDocModalEquip(equip);
        setShowDocModal(true);
    };

    const openReportModal = (equip) => {
        setReportEquip(equip);
        setIssueDescription("");
        setShowReportModal(false); // set to true
        setShowReportModal(true);
    };

    const openRateModal = (equip) => {
        setRateEquip(equip);
        setNewRate(equip.costPerHour || 5.0);
        setShowRateModal(true);
    };

    const handleSaveRate = async () => {
        if (!rateEquip) return;
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`http://localhost:8080/api/equipment/${rateEquip.id}/cost`, { costPerHour: Number(newRate) }, { headers });
            alert("External equipment hourly rate updated successfully.");
            setShowRateModal(false);
            loadEquipmentData();
        } catch (err) {
            console.error("Error updating equipment rate", err);
            alert("Failed to update rate.");
        }
    };

    const handleReportIssue = async () => {
        if (!issueDescription.trim()) {
            alert("Please describe the issue.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const userId = localStorage.getItem("userId");

            await axios.post(
                "http://localhost:8080/api/maintenance",
                {
                    equipment: { id: reportEquip.id },
                    reportedBy: { userId: Number(userId) },
                    issueDescription: issueDescription,
                    maintenanceType: "Corrective",
                    status: "Reported"
                },
                { headers }
            );

            alert("Issue reported successfully to the Lab Manager.");
            setShowReportModal(false);
        } catch (error) {
            console.error(error);
            alert("Failed to report issue.");
        }
    };

    const getEquipmentCurrentStatus = (item) => {
        if (item.status && (
            item.status.equalsIgnoreCase("Under Maintenance") ||
            item.status.equalsIgnoreCase("Out of Service") ||
            item.status.equalsIgnoreCase("Retired")
        )) {
            return item.status;
        }

        const now = new Date();
        const activeBooking = bookingsList.find(b => {
            if (!b.equipment || b.equipment.id !== item.id) return false;
            if (b.status !== "In Use" && b.status !== "Confirmed" && b.status !== "Booked") return false;

            if (b.status === "In Use") return true;

            if (b.bookingDate && b.startTime && b.endTime) {
                const bookingStart = new Date(`${b.bookingDate}T${b.startTime}`);
                const bookingEnd = new Date(`${b.bookingDate}T${b.endTime}`);
                return now >= bookingStart && now <= bookingEnd;
            }
            return false;
        });

        if (activeBooking) {
            return activeBooking.status === "In Use" ? "In Use" : "Booked";
        }

        return item.status || "Available";
    };

    const getStatusBadge = (status) => {
        const s = status ? status.toUpperCase() : "AVAILABLE";
        if (s === "AVAILABLE") return <Badge bg="success" className="p-2">Available</Badge>;
        if (s === "BOOKED") return <Badge bg="warning" text="dark" className="p-2">Booked</Badge>;
        if (s === "IN USE") return <Badge bg="primary" className="p-2">In Use</Badge>;
        if (s === "UNDER MAINTENANCE") return <Badge bg="danger" className="p-2">Under Maintenance</Badge>;
        if (s === "OUT OF SERVICE") return <Badge bg="dark" className="p-2">Out of Service</Badge>;
        if (s === "RETIRED") return <Badge bg="secondary" className="p-2">Retired</Badge>;
        return <Badge bg="secondary" className="p-2">{status}</Badge>;
    };

    // Filter by search query
    const filteredEquipment = equipment.filter(item => {
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const name = item.equipmentName?.toLowerCase() || "";
            const serial = item.serialNumber?.toLowerCase() || "";
            const cat = item.category?.toLowerCase() || "";
            const inst = item.laboratory?.department?.institution?.institutionName?.toLowerCase() || "";
            if (!name.includes(q) && !serial.includes(q) && !cat.includes(q) && !inst.includes(q)) {
                return false;
            }
        }
        return true;
    });

    return (
        <DashboardLayout title="Equipment Directory & Inventory">
            <Container fluid className="px-0">
                {/* Search & Hierarchical Filter Card */}
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="text-muted small fw-bold">Search Equipment</Form.Label>
                                <InputGroup size="sm">
                                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by name, serial, category..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="text-muted small fw-bold">Institution</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={selectedInstitution}
                                    onChange={handleInstitutionChange}
                                >
                                    <option value="">All Accessible Institutions</option>
                                    {institutions.map((inst) => (
                                        <option key={inst.institutionId} value={inst.institutionId}>
                                            {inst.institutionName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label className="text-muted small fw-bold">Department</Form.Label>
                                <Form.Select
                                    size="sm"
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
                            <Col md={3}>
                                <Form.Label className="text-muted small fw-bold">Laboratory</Form.Label>
                                <Form.Select
                                    size="sm"
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

                        {/* Ownership Filter Bar - Visible ONLY to Administrators */}
                        {isAdmin && (
                            <Row className="mt-3 pt-2 border-top align-items-center">
                                <Col md={6} className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-muted d-flex align-items-center gap-1">
                                        <FaFilter size={12} /> Ownership Filter:
                                    </span>
                                    {["ALL", "OWNED", "SHARED"].map(type => (
                                        <Button
                                            key={type}
                                            variant={ownershipFilter === type ? "primary" : "outline-secondary"}
                                            size="sm"
                                            className="py-0 px-2"
                                            style={{ fontSize: "0.75rem" }}
                                            onClick={() => setOwnershipFilter(type)}
                                        >
                                            {type === "ALL" ? "All Equipment" : type === "OWNED" ? "Owned by My Institute" : "Shared with My Institute"}
                                        </Button>
                                    ))}
                                </Col>
                                <Col md={6} className="text-end">
                                    <small className="text-muted">Showing {filteredEquipment.length} devices</small>
                                </Col>
                            </Row>
                        )}
                    </Card.Body>
                </Card>

                {/* Equipment Cards Grid */}
                <Row className="g-4">
                    {filteredEquipment.length === 0 ? (
                        <Col>
                            <Card className="text-center p-5 border-0 bg-transparent shadow-none">
                                <FaLaptop size={55} className="text-muted mb-3 mx-auto" />
                                <h5>No Equipment Available</h5>
                                <p className="text-muted small">No equipment records found matching your filters.</p>
                            </Card>
                        </Col>
                    ) : (
                        filteredEquipment.map((item) => {
                            const currentStatus = getEquipmentCurrentStatus(item);
                            const eqInstId = item.laboratory?.department?.institution?.institutionId;
                            const isOwnInstitute = userInstId && eqInstId && userInstId.toString() === eqInstId.toString();
                            const rate = (item.costPerHour && item.costPerHour > 0) ? item.costPerHour : 5.0;

                            return (
                                <Col lg={4} md={6} key={item.id}>
                                    <Card className="shadow-sm h-100 border rounded hover-shadow transition">
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
                                            <div className="text-center p-3 bg-light rounded-top d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                                                <img 
                                                    src="/images/equipment/placeholder.jpg" 
                                                    alt="Placeholder" 
                                                    style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }}
                                                />
                                            </div>
                                        )}
                                        <Card.Body className="d-flex flex-column justify-content-between">
                                            <div>
                                                {/* Ownership Distinction Badge - Visible ONLY to Administrators */}
                                                {isAdmin && (
                                                    <div className="mb-2 d-flex justify-content-between align-items-center">
                                                        {isOwnInstitute ? (
                                                            <Badge bg="success" className="text-uppercase" style={{ fontSize: "0.7rem" }}>
                                                                Owned by My Institute
                                                            </Badge>
                                                        ) : (
                                                            <Badge bg="info" className="text-uppercase" style={{ fontSize: "0.7rem" }}>
                                                                Shared from {item.laboratory?.department?.institution?.institutionName || "Partner Institute"}
                                                            </Badge>
                                                        )}
                                                        {canEditRate && (
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                className="p-1 lh-1"
                                                                title="Edit External Hourly Cost"
                                                                onClick={() => openRateModal(item)}
                                                            >
                                                                <FaEdit size={11} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}

                                                <Card.Title className="fw-bold text-primary">{item.equipmentName}</Card.Title>
                                                <hr className="my-2" style={{ borderColor: "rgba(0,0,0,0.08)" }} />
                                                <Card.Text className="small text-muted mb-3">
                                                    <strong>Category:</strong> {item.category}
                                                    <br />
                                                    <strong>Manufacturer:</strong> {item.manufacturer} ({item.model})
                                                    <br />
                                                    <strong>Status:</strong> {getStatusBadge(currentStatus)}
                                                    <br />
                                                    {isAdmin && (
                                                        <>
                                                            <strong>Owning Institute:</strong> {item.laboratory?.department?.institution?.institutionName || "N/A"}
                                                            <br />
                                                        </>
                                                    )}
                                                    <strong>Dept & Lab:</strong> {item.laboratory?.department?.departmentName} - {item.laboratory?.labName}
                                                    {isAdmin && (
                                                        <>
                                                            <br />
                                                            <strong>Cost Rate:</strong> {isOwnInstitute ? "₹0.00/hr (Internal)" : `₹${rate.toFixed(2)}/hr (External)`}
                                                        </>
                                                    )}
                                                    {item.specifications && (
                                                        <>
                                                            <br />
                                                            <strong>Specifications:</strong> {item.specifications}
                                                        </>
                                                    )}
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
                                                    disabled={currentStatus?.toUpperCase() === "UNDER MAINTENANCE" || currentStatus?.toUpperCase() === "OUT OF SERVICE" || currentStatus?.toUpperCase() === "RETIRED"}
                                                >
                                                    <FaCalendarAlt className="me-2" /> Book Now
                                                </Button>
                                                {("STUDENT".equalsIgnoreCase(role) || "RESEARCHER".equalsIgnoreCase(role)) && (
                                                    <Button
                                                        variant="outline-warning"
                                                        className="w-100"
                                                        onClick={() => openReportModal(item)}
                                                        disabled={currentStatus?.toUpperCase() === "RETIRED"}
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
                    loadEquipmentData();
                }}
                equipment={selectedEquip}
            />

            {/* Documentation Modal */}
            <Modal show={showDocModal} onHide={() => setShowDocModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="d-flex align-items-center">
                        <FaBookOpen className="me-2 text-primary" />
                        <span>Documentation & User Guide</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {docModalEquip && (
                        <div>
                            <h5 className="text-primary fw-bold mb-1">{docModalEquip.equipmentName}</h5>
                            <p className="text-muted small mb-3">
                                {docModalEquip.manufacturer} - Model: {docModalEquip.model} | Serial: {docModalEquip.serialNumber}
                            </p>
                            <hr />
                            <h6 className="fw-bold text-dark mt-3">Device Description & Scope:</h6>
                            <p className="text-secondary small">{docModalEquip.description || "No general description provided."}</p>
                            
                            <h6 className="fw-bold text-dark mt-3">Technical Specifications:</h6>
                            <p className="text-secondary small">{docModalEquip.specifications || "Standard laboratory grade specifications."}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowDocModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Report Issue Modal */}
            <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="text-warning d-flex align-items-center">
                        <span>Report Equipment Issue</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reportEquip && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Equipment Name</Form.Label>
                                <Form.Control type="text" value={reportEquip.equipmentName} disabled />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Issue Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    placeholder="Describe the malfunction, damage, or required maintenance in detail..."
                                    value={issueDescription}
                                    onChange={(e) => setIssueDescription(e.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={handleReportIssue}>Submit Issue Report</Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Rate Modal */}
            <Modal show={showRateModal} onHide={() => setShowRateModal(false)} centered size="sm">
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fs-6 fw-bold">Set External Hourly Cost</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {rateEquip && (
                        <Form>
                            <p className="small text-muted mb-2">{rateEquip.equipmentName}</p>
                            <Form.Group>
                                <Form.Label className="small fw-bold">Cost Per Hour (₹)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={newRate}
                                    onChange={(e) => setNewRate(e.target.value)}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" size="sm" onClick={() => setShowRateModal(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleSaveRate}>Save Rate</Button>
                </Modal.Footer>
            </Modal>
        </DashboardLayout>
    );
};

export default Equipment;