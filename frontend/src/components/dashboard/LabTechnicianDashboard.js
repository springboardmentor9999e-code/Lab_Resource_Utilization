import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge, Form } from "react-bootstrap";
import {
    FaTools,
    FaWrench,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCalendarCheck,
    FaLock
} from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function LabTechnicianDashboard() {
    const [realtimeData, setRealtimeData] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Realtime stats
            const realtimeRes = await axios.get("http://localhost:8080/api/dashboard/realtime", { headers });
            setRealtimeData(realtimeRes.data);

            // 2. Get equipment list
            const equipmentRes = await axios.get("http://localhost:8080/api/equipment", { headers });
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
            const headers = { Authorization: `Bearer ${token}` };
            const updatedEquipment = { ...equipment, status: newStatus };
            
            if ("Under Maintenance".equalsIgnoreCase(newStatus) || "Out of Service".equalsIgnoreCase(newStatus)) {
                updatedEquipment.availableQuantity = 0;
            } else if ("Available".equalsIgnoreCase(newStatus)) {
                updatedEquipment.availableQuantity = equipment.totalQuantity;
            }

            await axios.put(`http://localhost:8080/api/equipment/${equipment.id}`, updatedEquipment, { headers });

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

    if (loading || !realtimeData) {
        return (
            <DashboardLayout title="Lab Technician Dashboard">
                <div className="text-center py-5 text-muted">
                    <h5>Loading dashboard intelligence...</h5>
                </div>
            </DashboardLayout>
        );
    }

    const chartData = {
        labels: (realtimeData.equipmentMaintenanceFrequency || []).map(item => item.name),
        datasets: [
            {
                label: "Maintenance Issues Logged",
                data: (realtimeData.equipmentMaintenanceFrequency || []).map(item => item.value),
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    return (
        <DashboardLayout title="Lab Technician Dashboard">
            <Card className="shadow border-0 mb-4 bg-light">
                <Card.Body>
                    <h3>Welcome, {localStorage.getItem("fullName")} 👋</h3>
                    <p className="text-muted mb-0">
                        Monitor equipment health status, perform preventive maintenance, and manage device calibration records.
                    </p>
                </Card.Body>
            </Card>

            <Row className="g-4 mb-4">
                <Col md={4} lg={2.4}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaExclamationTriangle size={36} className="text-danger mb-2" />
                            <h3>{realtimeData.equipmentUnderMaintenance}</h3>
                            <p className="mb-0 text-muted small fw-bold">Under Maintenance</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2.4}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaTools size={36} className="text-warning mb-2" />
                            <h3>{realtimeData.pendingMaintenanceRequests}</h3>
                            <p className="mb-0 text-muted small fw-bold">Pending Issues</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} lg={2.4}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaWrench size={36} className="text-primary mb-2" />
                            <h3>{realtimeData.scheduledMaintenance}</h3>
                            <p className="mb-0 text-muted small fw-bold">Scheduled PMs</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={2.4}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaCalendarCheck size={36} className="text-success mb-2" />
                            <h3>{realtimeData.completedMaintenance}</h3>
                            <p className="mb-0 text-muted small fw-bold">Completed Tasks</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} lg={2.4}>
                    <Card className="shadow text-center h-100">
                        <Card.Body>
                            <FaLock size={36} className="text-secondary mb-2" />
                            <h3>{realtimeData.equipmentCurrentlyUnavailable}</h3>
                            <p className="mb-0 text-muted small fw-bold">Unavailable Units</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4 mb-4">
                <Col lg={12}>
                    <Card className="shadow">
                        <Card.Header className="bg-transparent border-0 py-3">
                            <h5 className="mb-0 fw-bold">Equipment Maintenance Issue Frequency</h5>
                        </Card.Header>
                        <Card.Body>
                            {(realtimeData.equipmentMaintenanceFrequency || []).length === 0 ? (
                                <p className="text-center text-muted py-5 mb-0">No maintenance tickets logged yet.</p>
                            ) : (
                                <div style={{ width: "100%", height: "260px" }}>
                                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="shadow mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Equipment Status & Lifecycle Log</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table striped hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Equipment Name</th>
                                <th>Model & Serial</th>
                                <th>Laboratory</th>
                                <th>Status</th>
                                <th>Quick Actions</th>
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