import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge, Form, Button } from "react-bootstrap";
import {
    FaTools,
    FaLaptop,
    FaWrench,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

function LabTechnicianDashboard() {
    const [stats, setStats] = useState({
        totalEquipment: 0,
        availableEquipment: 0,
        maintenanceEquipment: 0
    });
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            
            // Get stats
            const statsRes = await axios.get("http://localhost:8080/api/dashboard/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(statsRes.data);

            // Get equipment list
            const equipmentRes = await axios.get("http://localhost:8080/api/equipment", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEquipmentList(equipmentRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error loading technician dashboard", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusChange = async (equipment, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const updatedEquipment = { ...equipment, status: newStatus };
            
            // If marked as maintenance, reduce available quantity
            if ("Under Maintenance".equalsIgnoreCase(newStatus) || "Out of Service".equalsIgnoreCase(newStatus)) {
                updatedEquipment.availableQuantity = 0;
            } else if ("Available".equalsIgnoreCase(newStatus)) {
                updatedEquipment.availableQuantity = equipment.totalQuantity;
            }

            await axios.put(`http://localhost:8080/api/equipment/${equipment.id}`, updatedEquipment, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert(`Status of ${equipment.equipmentName} updated to ${newStatus}`);
            fetchData();
        } catch (error) {
            console.error("Error updating equipment status", error);
            alert("Failed to update status.");
        }
    };

    const getStatusBadge = (status) => {
        if ("Available".equalsIgnoreCase(status) || "Working".equalsIgnoreCase(status)) return "success";
        if ("Under Maintenance".equalsIgnoreCase(status)) return "warning";
        return "danger";
    };

    return (
        <DashboardLayout title="Lab Technician Dashboard">
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Monitor equipment health status, perform preventive maintenance, and manage device calibration records.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaLaptop size={42} className="text-primary mb-3" />
                            <h2>{stats.totalEquipment}</h2>
                            <p className="mb-0 text-muted">Total Managed Equipment</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaCheckCircle size={42} className="text-success mb-3" />
                            <h2>{stats.availableEquipment}</h2>
                            <p className="mb-0 text-muted">Operational Units</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="shadow text-center">
                        <Card.Body>
                            <FaExclamationTriangle size={42} className="text-danger mb-3" />
                            <h2>{stats.maintenanceEquipment}</h2>
                            <p className="mb-0 text-muted">Under Maintenance / Faulty</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Today's Inspection Schedule</h5>
                        </Card.Header>
                        <Card.Body>
                            <p className="mb-2">✔ Run diagnostic self-test on Nvidia Jetson modules</p>
                            <p className="mb-2">✔ Calibrate IoT sensor kits for Advanced IoT Lab</p>
                            <p className="mb-2">✔ Check server temperatures in AI Research Lab</p>
                            <p className="mb-0">✔ Inspect backup power supply for GPU racks</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="shadow h-100">
                        <Card.Header>
                            <h5 className="mb-0">Quick Support Channels</h5>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column justify-content-between">
                            <p className="text-muted mb-3">Initiate calibration requests or coordinate system repairs with suppliers.</p>
                            <div className="d-flex gap-2">
                                <Button variant="warning" className="w-100"><FaWrench className="me-2" /> Request Calibration</Button>
                                <Button variant="primary" className="w-100"><FaTools className="me-2" /> Log Support Ticket</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header>
                    <h5 className="mb-0">Equipment Status & Lifecycle Log</h5>
                </Card.Header>
                <Card.Body>
                    {loading ? (
                        <p className="text-center text-muted mb-0 py-3">Loading inventory...</p>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead>
                                <tr>
                                    <th>Equipment Name</th>
                                    <th>Model & Serial</th>
                                    <th>Laboratory</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipmentList.map((eq) => (
                                    <tr key={eq.id}>
                                        <td>
                                            <strong>{eq.equipmentName}</strong>
                                            <br />
                                            <small className="text-muted">Category: {eq.category}</small>
                                        </td>
                                        <td>
                                            <span>Mfr: {eq.manufacturer} ({eq.model})</span>
                                            <br />
                                            <small className="text-muted">S/N: {eq.serialNumber}</small>
                                        </td>
                                        <td>{eq.laboratory ? eq.laboratory.labName : "N/A"}</td>
                                        <td>
                                            <Badge bg={getStatusBadge(eq.status)}>{eq.status}</Badge>
                                        </td>
                                        <td style={{ minWidth: "180px" }}>
                                            <Form.Select
                                                size="sm"
                                                value={eq.status}
                                                onChange={(e) => handleStatusChange(eq, e.target.value)}
                                            >
                                                <option value="Available">Available</option>
                                                <option value="Booked">Booked</option>
                                                <option value="Under Maintenance">Under Maintenance</option>
                                                <option value="Out of Service">Out of Service</option>
                                            </Form.Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default LabTechnicianDashboard;