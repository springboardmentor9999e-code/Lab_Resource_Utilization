import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Badge, Form, InputGroup } from "react-bootstrap";
import {
    FaTools,
    FaWrench,
    FaCheckCircle,
    FaExclamationTriangle,
    FaCalendarCheck,
    FaLock,
    FaSearch,
    FaFilter
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
import ConfirmationModal from "../common/ConfirmationModal";

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function LabTechnicianDashboard() {
    const [realtimeData, setRealtimeData] = useState(null);
    const [equipmentList, setEquipmentList] = useState([]);
    const [bookingsList, setBookingsList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

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

            // 3. Get bookings list
            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", { headers });
            setBookingsList(bookingsRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error("Error loading technician dashboard", error);
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
        fetchData();
        // Dynamic auto refresh: poll data every 5 seconds
        const intervalId = setInterval(fetchData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleStatusChange = async (equipment, newStatus) => {
        triggerConfirm("Confirm Status Update", `Are you sure you want to change the status of "${equipment.equipmentName}" to "${newStatus}"?`, async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const updatedEquipment = { ...equipment, status: newStatus };
                
                if ("Under Maintenance".equalsIgnoreCase(newStatus) || "Out of Service".equalsIgnoreCase(newStatus) || "Retired".equalsIgnoreCase(newStatus)) {
                    updatedEquipment.availableQuantity = 0;
                } else if ("Available".equalsIgnoreCase(newStatus)) {
                    updatedEquipment.availableQuantity = equipment.totalQuantity;
                }

                await axios.put(`http://localhost:8080/api/equipment/${equipment.id}`, updatedEquipment, { headers });

                alert(`Status of ${equipment.equipmentName} updated to ${newStatus}`);
                fetchData();
            } catch (error) {
                console.error("Error updating equipment status", error);
                alert(error.response?.data?.message || "Failed to update status.");
            }
        });
    };

    const getStatusColorStyle = (status) => {
        if (!status) return { backgroundColor: "#6c757d", color: "#fff" };
        const s = status.toUpperCase();
        if (s.includes("AVAILABLE") || s === "WORKING") {
            return { backgroundColor: "#28a745", color: "#fff" }; // Green
        }
        if (s.includes("PENDING APPROVAL") || s === "PENDING") {
            return { backgroundColor: "#fd7e14", color: "#fff" }; // Orange
        }
        if (s === "CONFIRMED" || s === "APPROVED") {
            return { backgroundColor: "#007bff", color: "#fff" }; // Blue
        }
        if (s === "BOOKED") {
            return { backgroundColor: "#6f42c1", color: "#fff" }; // Purple
        }
        if (s.includes("IN USE") || s === "ACTIVE") {
            return { backgroundColor: "#17a2b8", color: "#fff" }; // Cyan
        }
        if (s === "COMPLETED") {
            return { backgroundColor: "#1e4620", color: "#fff" }; // Dark Green
        }
        if (s === "CANCELLED" || s === "CANCELED") {
            return { backgroundColor: "#dc3545", color: "#fff" }; // Red
        }
        if (s === "REJECTED") {
            return { backgroundColor: "#8b0000", color: "#fff" }; // Dark Red
        }
        if (s === "EXPIRED") {
            return { backgroundColor: "#6c757d", color: "#fff" }; // Gray
        }
        if (s.includes("UNDER MAINTENANCE") || s === "RESOLVING") {
            return { backgroundColor: "#ffc107", color: "#000" }; // Yellow
        }
        if (s.includes("OUT OF SERVICE")) {
            return { backgroundColor: "#000000", color: "#fff" }; // Black
        }
        if (s === "RETIRED") {
            return { backgroundColor: "#8B4513", color: "#fff" }; // Brown
        }
        return { backgroundColor: "#6c757d", color: "#fff" }; // Default Gray
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

    // Prepare chart data
    const chartData = {
        labels: (realtimeData.equipmentMaintenanceFrequency || []).map(item => item.name),
        datasets: [
            {
                label: "Maintenance Incidents",
                data: (realtimeData.equipmentMaintenanceFrequency || []).map(item => item.value),
                backgroundColor: "rgba(255, 159, 64, 0.6)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
                borderRadius: 5
            }
        ]
    };

    // Filter and search logic
    const filteredEquipment = equipmentList.filter(eq => {
        const matchesSearch = eq.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (eq.laboratory && eq.laboratory.labName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus = statusFilter === "ALL" || eq.status.equalsIgnoreCase(statusFilter);

        return matchesSearch && matchesStatus;
    });

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

            {/* Filter and Search Bar */}
            <Card className="shadow border-0 mb-4">
                <Card.Body>
                    <Row className="g-3">
                        <Col md={7}>
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0">
                                    <FaSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by equipment or lab name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0"
                                />
                            </InputGroup>
                        </Col>
                        <Col md={5}>
                            <InputGroup>
                                <InputGroup.Text className="bg-transparent border-end-0">
                                    <FaFilter className="text-muted" />
                                </InputGroup.Text>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border-start-0"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="Available">Available</option>
                                    <option value="Booked">Booked</option>
                                    <option value="In Use">In Use</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Out of Service">Out of Service</option>
                                    <option value="Retired">Retired</option>
                                </Form.Select>
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card className="shadow mb-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0 fw-bold">Equipment Status & Booking Lifecycle Log</h5>
                </Card.Header>
                <Card.Body className="p-0">
                    <Table striped hover responsive className="mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Equipment Name</th>
                                <th>Status</th>
                                <th>Current User</th>
                                <th>Booking Start</th>
                                <th>Booking End</th>
                                <th>Laboratory</th>
                                <th>Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEquipment.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No equipment matches your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredEquipment.map((eq) => {
                                    // Find current active booking for this equipment
                                    const activeBooking = bookingsList.find(b => 
                                        b.equipment && 
                                        b.equipment.id === eq.id && 
                                        ("In Use".equalsIgnoreCase(b.status) || "Booked".equalsIgnoreCase(b.status) || "Approved".equalsIgnoreCase(b.status) || "Confirmed".equalsIgnoreCase(b.status))
                                    );

                                    return (
                                        <tr key={eq.id}>
                                            <td>
                                                <strong className="text-dark">{eq.equipmentName}</strong>
                                                <br />
                                                <small className="text-muted">Mfr: {eq.manufacturer} ({eq.model})</small>
                                            </td>
                                            <td>
                                                <Badge style={getStatusColorStyle(eq.status)} className="p-2">{eq.status}</Badge>
                                            </td>
                                            <td>
                                                {activeBooking && activeBooking.user ? (
                                                    <span className="fw-semibold text-primary">{activeBooking.user.fullName}</span>
                                                ) : (
                                                    <span className="text-muted">None</span>
                                                )}
                                            </td>
                                            <td>
                                                {activeBooking ? (
                                                    <small>{activeBooking.bookingDate} {activeBooking.startTime}</small>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                {activeBooking ? (
                                                    <small>{activeBooking.bookingDate} {activeBooking.endTime}</small>
                                                ) : (
                                                    <span className="text-muted">N/A</span>
                                                )}
                                            </td>
                                            <td>{eq.laboratory ? eq.laboratory.labName : "N/A"}</td>
                                            <td style={{ minWidth: "180px" }}>
                                                <Form.Select
                                                    size="sm"
                                                    value={eq.status}
                                                    onChange={(e) => handleStatusChange(eq, e.target.value)}
                                                >
                                                    <option value="Available">Available</option>
                                                    <option value="Booked">Booked</option>
                                                    <option value="In Use">In Use</option>
                                                    <option value="Under Maintenance">Under Maintenance</option>
                                                    <option value="Out of Service">Out of Service</option>
                                                    <option value="Retired">Retired</option>
                                                </Form.Select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
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
    return (anotherString + "").toLowerCase() === this.toLowerCase();
};

export default LabTechnicianDashboard;