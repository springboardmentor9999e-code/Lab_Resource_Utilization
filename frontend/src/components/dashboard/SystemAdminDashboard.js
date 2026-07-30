import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Form, Modal, Badge } from "react-bootstrap";
import { FaUniversity, FaUsers, FaLaptop, FaPlusCircle } from "react-icons/fa";
import institutionService from "../../services/institutionService";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

function SystemAdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLaboratories: 0,
        totalEquipment: 0
    });
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUniversity size={42} className="text-primary mb-3" />
                            <h2>{institutions.length}</h2>
                            <p className="mb-0 text-muted">Total Institutions</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaUsers size={42} className="text-success mb-3" />
                            <h2>{stats.totalUsers}</h2>
                            <p className="mb-0 text-muted">Platform Users</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-warning mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Equipment Tracked</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Institutions Directory</h5>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <FaPlusCircle className="me-2" /> Add Institution
                </Button>
            </div>

            <Card className="shadow mb-4">
                <Card.Body>
                    {loading ? (
                        <p className="text-center text-muted mb-0 py-3">Loading directory...</p>
                    ) : institutions.length === 0 ? (
                        <p className="text-center text-muted mb-0 py-3">No institutions registered.</p>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Institution Code</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Contact Info</th>
                                    <th>Website</th>
                                    <th>Status</th>
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
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
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
        </DashboardLayout>
    );
}

export default SystemAdminDashboard;
