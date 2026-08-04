import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Button, Modal, Form, Row, Col, InputGroup, ProgressBar } from "react-bootstrap";
import { FaDollarSign, FaClock, FaChartPie, FaSearch, FaFilter, FaEdit, FaCheck } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";

function UtilizationCost() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filtering states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [labFilter, setLabFilter] = useState("");

    // Configuration Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEquip, setSelectedEquip] = useState(null);
    const [newCostPerHour, setNewCostPerHour] = useState("");

    const role = localStorage.getItem("role");

    const loadStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            const response = await axios.get("http://localhost:8080/api/utilization/stats", { headers });
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading utilization stats", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const openEditModal = (item) => {
        setSelectedEquip(item);
        setNewCostPerHour(item.costPerHour);
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const costVal = parseFloat(newCostPerHour);
        if (isNaN(costVal) || costVal < 0) {
            alert("Please enter a valid non-negative cost value.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Retrieve the full equipment object first to perform a safe update
            const eqResponse = await axios.get(`http://localhost:8080/api/equipment/${selectedEquip.equipmentId}`, { headers });
            const equipmentData = eqResponse.data;

            // Update costPerHour
            equipmentData.costPerHour = costVal;

            await axios.put(`http://localhost:8080/api/equipment/${selectedEquip.equipmentId}`, equipmentData, { headers });
            alert("Hourly cost updated successfully.");
            setShowEditModal(false);
            loadStats();
        } catch (error) {
            console.error("Error updating hourly cost", error);
            alert("Failed to update cost.");
        }
    };

    // Calculate aggregated metrics
    const totalCost = stats.reduce((acc, curr) => acc + curr.totalCost, 0);
    const totalHours = stats.reduce((acc, curr) => acc + curr.totalHoursUsed, 0);
    const totalBookings = stats.reduce((acc, curr) => acc + curr.usageCount, 0);
    const avgUtilization = stats.length > 0 
        ? (stats.reduce((acc, curr) => acc + curr.utilizationPercentage, 0) / stats.length) 
        : 0;

    // Get unique filters
    const categories = [...new Set(stats.map(s => s.category))];
    const labs = [...new Set(stats.map(s => s.labName))];

    // Filtered list
    const filteredStats = stats.filter(item => {
        const matchesSearch = item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
        const matchesLab = labFilter === "" || item.labName === labFilter;
        return matchesSearch && matchesCategory && matchesLab;
    });

    const isPrivileged = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN", "LAB_MANAGER"].includes(role);

    return (
        <DashboardLayout title="Utilization & Cost Dashboard">
            <Container fluid className="px-0">
                {/* banner info */}
                <Card className="shadow border-0 mb-4 bg-light">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            {role === "STUDENT" || role === "RESEARCHER" 
                                ? "Overview of utilization costs and reservation hours for equipment you have booked."
                                : "Analyze equipment utilization percentages, hourly operational costs, and overall resource investment across departments and laboratories."
                            }
                        </p>
                    </Card.Body>
                </Card>

                {/* KPI metrics cards */}
                <Row className="g-4 mb-4">
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 h-100 bg-success text-white">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaDollarSign size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Total Utilization Cost</h6>
                                    <h4 className="fw-bold mb-0">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 h-100 bg-primary text-white">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaClock size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Total Usage Duration</h6>
                                    <h4 className="fw-bold mb-0">{totalHours.toFixed(1)} hrs</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 h-100 bg-warning text-dark">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-dark bg-opacity-10 rounded me-3">
                                    <FaChartPie size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-dark-50 mb-1">Avg Utilization Rate</h6>
                                    <h4 className="fw-bold mb-0">{avgUtilization.toFixed(2)}%</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 h-100 bg-info text-white">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaCheck size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Total Sessions Logged</h6>
                                    <h4 className="fw-bold mb-0">{totalBookings}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Filters card */}
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={4}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-end-0">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by equipment, serial..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-start-0 ps-0"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((c, i) => (
                                        <option key={i} value={c}>{c}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    value={labFilter}
                                    onChange={(e) => setLabFilter(e.target.value)}
                                >
                                    <option value="">All Laboratories</option>
                                    {labs.map((l, i) => (
                                        <option key={i} value={l}>{l}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* utilization details table */}
                <Card className="shadow">
                    <Card.Body className="p-0">
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading utilization details...</h5>
                        ) : filteredStats.length === 0 ? (
                            <h5 className="text-center text-muted py-5">No utilization logs match the criteria.</h5>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Equipment Info</th>
                                        <th>Laboratory</th>
                                        <th>Cost/Hour</th>
                                        <th className="text-center">Usage Count</th>
                                        <th className="text-center">Hours Used</th>
                                        <th style={{ width: "160px" }}>Utilization Rate</th>
                                        <th className="text-end pe-4">Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStats.map((item) => (
                                        <tr key={item.equipmentId}>
                                            <td>
                                                <div className="fw-bold text-primary">{item.equipmentName}</div>
                                                <small className="text-muted">Serial: {item.serialNumber} | Category: {item.category}</small>
                                            </td>
                                            <td>
                                                <div>{item.labName}</div>
                                                <small className="text-muted">{item.departmentName}</small>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <strong>${item.costPerHour.toFixed(2)}/hr</strong>
                                                    {isPrivileged && (
                                                        <Button
                                                            variant="link"
                                                            className="p-0 text-info"
                                                            onClick={() => openEditModal(item)}
                                                        >
                                                            <FaEdit size={14} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-center">{item.usageCount}</td>
                                            <td className="text-center">{item.totalHoursUsed.toFixed(1)} hrs</td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <ProgressBar 
                                                        now={item.utilizationPercentage} 
                                                        variant={item.utilizationPercentage > 50 ? "success" : item.utilizationPercentage > 15 ? "primary" : "warning"}
                                                        className="w-100"
                                                        style={{ height: "8px" }}
                                                    />
                                                    <span className="small fw-semibold">{item.utilizationPercentage}%</span>
                                                </div>
                                            </td>
                                            <td className="text-end fw-bold text-success pe-4">
                                                ${item.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* Configurable Cost Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Configure Equipment Billing Rate</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEditSubmit}>
                    <Modal.Body>
                        <h6 className="fw-bold mb-3">Equipment: {selectedEquip?.equipmentName}</h6>
                        <Form.Group className="mb-3">
                            <Form.Label>Billing Rate (Cost Per Hour in USD)</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newCostPerHour}
                                    onChange={(e) => setNewCostPerHour(e.target.value)}
                                    placeholder="Enter cost per hour..."
                                    required
                                />
                                <InputGroup.Text>/ hour</InputGroup.Text>
                            </InputGroup>
                            <Form.Text className="text-muted">
                                This cost will be used dynamically to compute the total laboratory, department, and institution utilization statistics.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button variant="success" type="submit">Save Rate</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default UtilizationCost;
