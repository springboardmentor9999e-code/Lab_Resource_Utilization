import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Form, Modal, Badge } from "react-bootstrap";
import { FaUniversity, FaUsers, FaLaptop, FaPlusCircle, FaEdit, FaTrash, FaBuilding } from "react-icons/fa";
import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

function SystemAdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLaboratories: 0,
        totalEquipment: 0
    });
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Directory tab selection
    const [activeTab, setActiveTab] = useState("institutions");

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

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Load general stats
            const statsRes = await axios.get("http://localhost:8080/api/dashboard/stats", { headers });
            setStats(statsRes.data);

            // Load institutions
            const instRes = await institutionService.getAllInstitutions();
            setInstitutions(instRes.data);

            // Load departments
            const deptRes = await departmentService.getAllDepartments();
            setDepartments(deptRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error loading system admin data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
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
        if (!window.confirm("Are you sure you want to remove this institution? This action will delete the institution and cannot be undone.")) {
            return;
        }
        try {
            await institutionService.deleteInstitution(id);
            alert("Institution successfully removed.");
            loadData();
        } catch (error) {
            console.error("Error deleting institution", error);
            alert("Failed to delete institution. It may have associated departments, laboratories, or users.");
        }
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
        if (!window.confirm("Are you sure you want to remove this department? This action cannot be undone.")) {
            return;
        }
        try {
            await departmentService.deleteDepartment(id);
            alert("Department successfully removed.");
            loadData();
        } catch (error) {
            console.error("Error deleting department", error);
            alert("Failed to delete department. It may have associated laboratories or equipment.");
        }
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

            <Row className="g-4 mb-4">
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUniversity size={42} className="text-primary mb-3" />
                            <h2>{institutions.length}</h2>
                            <p className="mb-0 text-muted">Institutions</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaBuilding size={42} className="text-info mb-3" />
                            <h2>{departments.length}</h2>
                            <p className="mb-0 text-muted">Departments</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUsers size={42} className="text-success mb-3" />
                            <h2>{stats.totalUsers}</h2>
                            <p className="mb-0 text-muted">Platform Users</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-warning mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Equipment Tracked</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Tab selection toggles */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2">
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
                </div>
                {activeTab === "institutions" ? (
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        <FaPlusCircle className="me-2" /> Add Institution
                    </Button>
                ) : (
                    <Button variant="success" onClick={() => setShowDeptModal(true)}>
                        <FaPlusCircle className="me-2" /> Add Department
                    </Button>
                )}
            </div>

            {/* Directory list container */}
            <Card className="shadow mb-4">
                <Card.Body className="p-0">
                    {loading ? (
                        <p className="text-center text-muted mb-0 py-5">Loading data directory...</p>
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
                    ) : (
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
                    )}
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
        </DashboardLayout>
    );
}

export default SystemAdminDashboard;
