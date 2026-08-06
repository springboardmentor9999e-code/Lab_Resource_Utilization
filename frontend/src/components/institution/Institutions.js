import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal, InputGroup, Pagination } from "react-bootstrap";
import { 
    FaUniversity, 
    FaSearch, 
    FaEdit, 
    FaTrash, 
    FaPlus, 
    FaEye, 
    FaBuilding, 
    FaFlask, 
    FaLaptop, 
    FaUsers, 
    FaUserShield, 
    FaChartLine, 
    FaExchangeAlt 
} from "react-icons/fa";
import DashboardLayout from "../dashboard/DashboardLayout";
import institutionService from "../../services/institutionService";
import ConfirmationModal from "../common/ConfirmationModal";

function Institutions() {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [stateFilter, setStateFilter] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInst, setSelectedInst] = useState(null);

    // Confirmation Modal States
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

    // Form States
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        loadInstitutions();
    }, []);

    const loadInstitutions = async () => {
        try {
            setLoading(true);
            const response = await institutionService.getAllInstitutions();
            setInstitutions(response.data);
            setError("");
        } catch (err) {
            console.error("Error loading institutions", err);
            setError("Failed to fetch institutions directory.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await institutionService.addInstitution(formData);
            setShowAddModal(false);
            resetForm();
            loadInstitutions();
            alert("Institution added successfully!");
        } catch (err) {
            console.error("Error adding institution", err);
            alert("Failed to add institution. Ensure Name and Code are unique.");
        }
    };

    const handleEditClick = (inst) => {
        setSelectedInst(inst);
        setFormData({
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

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await institutionService.updateInstitution(selectedInst.institutionId, formData);
            setShowEditModal(false);
            resetForm();
            loadInstitutions();
            alert("Institution updated successfully!");
        } catch (err) {
            console.error("Error updating institution", err);
            alert("Failed to update institution.");
        }
    };

    const handleDeleteClick = async (id) => {
        triggerConfirm("Delete Institution", "Are you sure you want to delete this institution? This will delete all associated departments and laboratories!", async () => {
            try {
                await institutionService.deleteInstitution(id);
                loadInstitutions();
                alert("Institution deleted successfully.");
            } catch (err) {
                console.error("Error deleting institution", err);
                alert("Failed to delete institution.");
            }
        });
    };

    const handleViewClick = (inst) => {
        setSelectedInst(inst);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setFormData({
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
        setSelectedInst(null);
    };

    // Extract unique states for filter
    const statesList = ["ALL", ...new Set(institutions.map(inst => inst.state).filter(Boolean))];

    // Search and Filter logic
    const filteredInstitutions = institutions.filter(inst => {
        const matchesSearch = 
            inst.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.institutionCode.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "ALL" || inst.status === statusFilter;
        const matchesState = stateFilter === "ALL" || inst.state === stateFilter;

        return matchesSearch && matchesStatus && matchesState;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInstitutions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage);

    return (
        <DashboardLayout title="University & Institute Registry">
            <Container fluid className="px-0">
                {/* Header overview card */}
                <Card className="shadow border-0 mb-4 bg-light">
                    <Card.Body className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div>
                            <h4 className="fw-bold mb-1 text-primary">Institute Management Hub</h4>
                            <p className="text-muted mb-0 small">
                                Oversee connected universities, configure profiles, inspect sharing rates, and audit resource utilisation indicators.
                            </p>
                        </div>
                        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => { resetForm(); setShowAddModal(true); }}>
                            <FaPlus /> Add New Institute
                        </Button>
                    </Card.Body>
                </Card>

                {error && <div className="alert alert-danger shadow-sm">{error}</div>}

                {/* Filters card */}
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Search Institutions</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text className="bg-transparent border-end-0">
                                            <FaSearch className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name or code..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                            className="border-start-0"
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Status</Form.Label>
                                    <Form.Select 
                                        value={statusFilter} 
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Filter by State</Form.Label>
                                    <Form.Select 
                                        value={stateFilter} 
                                        onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
                                    >
                                        {statesList.map(st => (
                                            <option key={st} value={st}>{st === "ALL" ? "All States" : st}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Table card */}
                <Card className="shadow border-0">
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5 text-muted">
                                <h5>Loading institutes registry...</h5>
                            </div>
                        ) : filteredInstitutions.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h5>No institutions match the current search or filters.</h5>
                            </div>
                        ) : (
                            <>
                                <Table striped hover responsive className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Code</th>
                                            <th>Name</th>
                                            <th>Location</th>
                                            <th>Contact Email</th>
                                            <th>Departments</th>
                                            <th>Labs</th>
                                            <th>Equipment</th>
                                            <th>Status</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((inst) => (
                                            <tr key={inst.institutionId}>
                                                <td><span className="badge bg-secondary font-monospace">{inst.institutionCode}</span></td>
                                                <td><strong className="text-dark">{inst.institutionName}</strong></td>
                                                <td>{inst.city}, {inst.state}</td>
                                                <td>{inst.contactEmail}</td>
                                                <td><Badge bg="info">{inst.totalDepartments ?? 0}</Badge></td>
                                                <td><Badge bg="primary">{inst.totalLaboratories ?? 0}</Badge></td>
                                                <td><Badge bg="success">{inst.totalEquipment ?? 0}</Badge></td>
                                                <td>
                                                    <Badge bg={inst.status === "ACTIVE" ? "success" : "danger"}>
                                                        {inst.status}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <Button variant="outline-primary" size="sm" onClick={() => handleViewClick(inst)} title="View Details">
                                                            <FaEye />
                                                        </Button>
                                                        <Button variant="outline-warning" size="sm" onClick={() => handleEditClick(inst)} title="Edit">
                                                            <FaEdit />
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(inst.institutionId)} title="Delete">
                                                            <FaTrash />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center py-3 border-top bg-light">
                                        <Pagination className="mb-0">
                                            <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                            <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                                            {[...Array(totalPages).keys()].map(page => (
                                                <Pagination.Item 
                                                    key={page + 1} 
                                                    active={page + 1 === currentPage}
                                                    onClick={() => setCurrentPage(page + 1)}
                                                >
                                                    {page + 1}
                                                </Pagination.Item>
                                            ))}
                                            <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                                            <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Modal: View Details */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                        <FaUniversity /> Institution Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedInst && (
                        <>
                            <h4 className="fw-bold mb-3 text-primary">{selectedInst.institutionName}</h4>
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <p className="mb-1 text-muted small fw-bold">INSTITUTION CODE</p>
                                    <p className="fw-bold fs-5 text-dark font-monospace">{selectedInst.institutionCode}</p>
                                </Col>
                                <Col md={6}>
                                    <p className="mb-1 text-muted small fw-bold">STATUS</p>
                                    <Badge bg={selectedInst.status === "ACTIVE" ? "success" : "danger"} className="px-3 py-2 fs-6">
                                        {selectedInst.status}
                                    </Badge>
                                </Col>
                                <Col md={12}>
                                    <p className="mb-1 text-muted small fw-bold">ADDRESS</p>
                                    <p className="text-dark mb-0">{selectedInst.address}</p>
                                    <p className="text-muted">{selectedInst.city}, {selectedInst.state} - {selectedInst.pincode}</p>
                                </Col>
                                <Col md={4}>
                                    <p className="mb-1 text-muted small fw-bold">CONTACT EMAIL</p>
                                    <p className="text-dark">{selectedInst.contactEmail || "N/A"}</p>
                                </Col>
                                <Col md={4}>
                                    <p className="mb-1 text-muted small fw-bold">CONTACT PHONE</p>
                                    <p className="text-dark">{selectedInst.contactPhone || "N/A"}</p>
                                </Col>
                                <Col md={4}>
                                    <p className="mb-1 text-muted small fw-bold">WEBSITE</p>
                                    <p><a href={`https://${selectedInst.website}`} target="_blank" rel="noreferrer" className="text-primary fw-bold">{selectedInst.website || "N/A"}</a></p>
                                </Col>
                            </Row>

                            <hr className="my-4" />
                            <h5 className="fw-bold mb-3 text-secondary">Analytics & Sharing Intelligence</h5>
                            <Row className="g-3">
                                <Col md={4}>
                                    <Card className="border border-light shadow-sm text-center py-3 bg-light h-100">
                                        <Card.Body className="p-2">
                                            <FaBuilding className="text-info mb-2 fs-4" />
                                            <h4 className="fw-bold mb-1">{selectedInst.totalDepartments ?? 0}</h4>
                                            <span className="text-muted small fw-bold">Departments</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border border-light shadow-sm text-center py-3 bg-light h-100">
                                        <Card.Body className="p-2">
                                            <FaFlask className="text-primary mb-2 fs-4" />
                                            <h4 className="fw-bold mb-1">{selectedInst.totalLaboratories ?? 0}</h4>
                                            <span className="text-muted small fw-bold">Laboratories</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="border border-light shadow-sm text-center py-3 bg-light h-100">
                                        <Card.Body className="p-2">
                                            <FaLaptop className="text-success mb-2 fs-4" />
                                            <h4 className="fw-bold mb-1">{selectedInst.totalEquipment ?? 0}</h4>
                                            <span className="text-muted small fw-bold">Equipment Count</span>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border border-light shadow-sm py-3 bg-light h-100">
                                        <Card.Body className="p-3 d-flex align-items-center">
                                            <FaUsers className="text-warning fs-3 me-3" />
                                            <div>
                                                <h5 className="fw-bold mb-0">{selectedInst.activeUsers ?? 0}</h5>
                                                <span className="text-muted small fw-bold">Active Staff & Students</span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6}>
                                    <Card className="border border-light shadow-sm py-3 bg-light h-100">
                                        <Card.Body className="p-3 d-flex align-items-center">
                                            <FaUserShield className="text-danger fs-3 me-3" />
                                            <div>
                                                <h5 className="fw-bold mb-0">{selectedInst.institutionAdministrator ?? "Not Assigned"}</h5>
                                                <span className="text-muted small fw-bold">Institution Administrator</span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={12}>
                                    <Card className="border border-light shadow-sm py-3 bg-light">
                                        <Card.Body className="p-3 d-flex align-items-center">
                                            <FaChartLine className="text-info fs-3 me-3" />
                                            <div>
                                                <h6 className="fw-bold mb-1 text-dark">Equipment Utilization Summary</h6>
                                                <span className="text-muted small">{selectedInst.equipmentUtilizationSummary || "No usage logged yet."}</span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={12}>
                                    <Card className="border border-light shadow-sm py-3 bg-light">
                                        <Card.Body className="p-3 d-flex align-items-center">
                                            <FaExchangeAlt className="text-success fs-3 me-3" />
                                            <div>
                                                <h6 className="fw-bold mb-1 text-dark">Resource Sharing Metrics</h6>
                                                <span className="text-muted small">{selectedInst.resourceSharingSummary || "No inter-institute requests recorded."}</span>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Modal: Add Institute */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Add New Institution</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Institution Name</Form.Label>
                                    <Form.Control type="text" name="institutionName" required value={formData.institutionName} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Institution Code</Form.Label>
                                    <Form.Control type="text" name="institutionCode" required value={formData.institutionCode} onChange={handleInputChange} placeholder="e.g. IITB" />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Street Address</Form.Label>
                                    <Form.Control type="text" name="address" required value={formData.address} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">City</Form.Label>
                                    <Form.Control type="text" name="city" required value={formData.city} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">State</Form.Label>
                                    <Form.Control type="text" name="state" required value={formData.state} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Pincode</Form.Label>
                                    <Form.Control type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Contact Email</Form.Label>
                                    <Form.Control type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Contact Phone</Form.Label>
                                    <Form.Control type="text" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Website</Form.Label>
                                    <Form.Control type="text" name="website" required value={formData.website} onChange={handleInputChange} placeholder="www.iitb.ac.in" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Status</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Add Institute</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal: Edit Institute */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold">Edit Institution</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Institution Name</Form.Label>
                                    <Form.Control type="text" name="institutionName" required value={formData.institutionName} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Institution Code</Form.Label>
                                    <Form.Control type="text" name="institutionCode" required value={formData.institutionCode} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Street Address</Form.Label>
                                    <Form.Control type="text" name="address" required value={formData.address} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">City</Form.Label>
                                    <Form.Control type="text" name="city" required value={formData.city} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">State</Form.Label>
                                    <Form.Control type="text" name="state" required value={formData.state} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Pincode</Form.Label>
                                    <Form.Control type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Contact Email</Form.Label>
                                    <Form.Control type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Contact Phone</Form.Label>
                                    <Form.Control type="text" name="contactPhone" required value={formData.contactPhone} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Website</Form.Label>
                                    <Form.Control type="text" name="website" required value={formData.website} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-bold">Status</Form.Label>
                                    <Form.Select name="status" value={formData.status} onChange={handleInputChange}>
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

export default Institutions;
