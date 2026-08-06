import React, { useEffect, useState } from "react";
import { Table, Card, Container, Row, Col, Badge, Form, InputGroup, Button } from "react-bootstrap";
import { FaChartBar, FaSearch, FaDollarSign, FaClock, FaClipboardCheck, FaPrint, FaFileCsv } from "react-icons/fa";
import axios from "axios";
import DashboardLayout from "../dashboard/DashboardLayout";

function Reports() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [owningFilter, setOwningFilter] = useState("");
    const [requestingFilter, setRequestingFilter] = useState("");
    const [institutionsMap, setInstitutionsMap] = useState({});

    const role = localStorage.getItem("role");

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch institutions mapping
            const instRes = await axios.get("http://localhost:8080/api/institutions", { headers });
            const insts = {};
            instRes.data.forEach(inst => {
                insts[inst.institutionId] = inst.institutionName;
            });
            setInstitutionsMap(insts);

            // Fetch sharing history bookings
            const response = await axios.get("http://localhost:8080/api/bookings/sharing-history", { headers });
            
            // Filters based on roles if they are not System Admin
            const profileRes = await axios.get("http://localhost:8080/api/profile", { headers });
            const myInstId = profileRes.data.institutionId;
            const myDeptId = profileRes.data.departmentId;
            
            let list = response.data;
            if (role === "INSTITUTION_ADMIN") {
                list = list.filter(b => 
                    b.equipment?.laboratory?.department?.institution?.institutionId === myInstId ||
                    (b.user && b.user.institutionId === myInstId)
                );
            } else if (role === "DEPARTMENT_HEAD" || role === "LAB_MANAGER" || role === "LAB_TECHNICIAN") {
                list = list.filter(b => 
                    b.equipment?.laboratory?.department?.departmentId === myDeptId ||
                    (b.user && b.user.departmentId === myDeptId)
                );
            }

            setHistory(list);
            setLoading(false);
        } catch (error) {
            console.error("Error loading sharing reports", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter logic
    const filteredHistory = history.filter(b => {
        const matchesSearch = 
            (b.equipment?.equipmentName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.user?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesStatus = statusFilter === "" || b.status.toLowerCase() === statusFilter.toLowerCase();
        
        const owningInstName = b.equipment?.laboratory?.department?.institution?.institutionName || "";
        const matchesOwning = owningFilter === "" || owningInstName === owningFilter;

        const requestingInstName = institutionsMap[b.user?.institutionId] || `Institute #${b.user?.institutionId}`;
        const matchesRequesting = requestingFilter === "" || requestingInstName === requestingFilter;

        return matchesSearch && matchesStatus && matchesOwning && matchesRequesting;
    });

    // Extract unique filter dropdown values
    const uniqueOwningInstitutes = [...new Set(history.map(b => b.equipment?.laboratory?.department?.institution?.institutionName).filter(Boolean))];
    const uniqueRequestingInstitutes = [...new Set(history.map(b => institutionsMap[b.user?.institutionId] || `Institute #${b.user?.institutionId}`).filter(Boolean))];

    // Compute aggregated reporting stats
    const totalTransactions = filteredHistory.length;
    const totalRevenue = filteredHistory
        .filter(b => "Completed".equalsIgnoreCase(b.status))
        .reduce((acc, curr) => acc + (curr.utilizationCost || 0), 0);
    const totalHours = filteredHistory
        .filter(b => "Completed".equalsIgnoreCase(b.status) || "Active".equalsIgnoreCase(b.status) || "In Use".equalsIgnoreCase(b.status))
        .reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const pendingCount = filteredHistory.filter(b => "Pending".equalsIgnoreCase(b.status)).length;

    // Export CSV Utility
    const exportToCSV = () => {
        const headers = ["Booking ID", "Equipment", "Requesting Institute", "Owning Institute", "User Name", "Duration (Hours)", "Cost (INR)", "Status", "Date", "Time"];
        const rows = filteredHistory.map(b => [
            b.bookingId,
            b.equipment?.equipmentName,
            institutionsMap[b.user?.institutionId] || `Institute #${b.user?.institutionId}`,
            b.equipment?.laboratory?.department?.institution?.institutionName || "N/A",
            b.user?.fullName,
            b.duration ? b.duration.toFixed(1) : 0,
            (b.utilizationCost || 0).toFixed(2),
            b.status,
            b.bookingDate,
            `${b.startTime} - ${b.endTime}`
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inter_institute_resource_sharing_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print Utility
    const handlePrint = () => {
        window.print();
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
        if (s === "BOOKED" || s === "RESERVED") {
            return { backgroundColor: "#6f42c1", color: "#fff" }; // Purple
        }
        if (s.includes("IN USE") || s === "ACTIVE" || s === "USING") {
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

    return (
        <DashboardLayout title="Inter-Institute Resource Sharing Reports">
            <Container fluid className="px-0 print-container">
                {/* Metrics header */}
                <Row className="g-4 mb-4 no-print">
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 bg-primary text-white h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaChartBar size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Total Transactions</h6>
                                    <h4 className="fw-bold mb-0">{totalTransactions}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 bg-success text-white h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaDollarSign size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Total Shared Revenue</h6>
                                    <h4 className="fw-bold mb-0">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 bg-info text-white h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded me-3">
                                    <FaClock size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-white-50 mb-1">Sharing Usage Hours</h6>
                                    <h4 className="fw-bold mb-0">{totalHours.toFixed(1)} hrs</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6}>
                        <Card className="shadow border-0 bg-warning text-dark h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className="p-3 bg-dark bg-opacity-10 rounded me-3">
                                    <FaClipboardCheck size={24} />
                                </div>
                                <div>
                                    <h6 className="small text-dark-50 mb-1">Pending Approvals</h6>
                                    <h4 className="fw-bold mb-0">{pendingCount}</h4>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Filters card */}
                <Card className="shadow border-0 mb-4 no-print">
                    <Card.Body>
                        <Row className="g-3">
                            <Col md={3}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-end-0">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by equipment, user..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-start-0 ps-0"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Form.Select
                                    value={owningFilter}
                                    onChange={(e) => setOwningFilter(e.target.value)}
                                >
                                    <option value="">All Owning Institutes</option>
                                    {uniqueOwningInstitutes.map((inst, i) => (
                                        <option key={i} value={inst}>{inst}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Select
                                    value={requestingFilter}
                                    onChange={(e) => setRequestingFilter(e.target.value)}
                                >
                                    <option value="">All Requesting Institutes</option>
                                    {uniqueRequestingInstitutes.map((inst, i) => (
                                        <option key={i} value={inst}>{inst}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Cancelled">Cancelled</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Print Title Header */}
                <div className="print-only mb-4 text-center">
                    <h3 className="fw-bold">Inter-Institute Resource Sharing Utilization Report</h3>
                    <p className="text-muted">Generated on: {new Date().toLocaleDateString()}</p>
                    <div className="d-flex justify-content-center gap-4 my-3">
                        <span><strong>Total Requests:</strong> {totalTransactions}</span>
                        <span><strong>Revenue Generated:</strong> ₹{totalRevenue.toFixed(2)}</span>
                        <span><strong>Total Usage:</strong> {totalHours.toFixed(1)} Hours</span>
                    </div>
                </div>

                {/* Main sharing history logs */}
                <Card className="shadow border-0">
                    <Card.Header className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center flex-wrap gap-2 no-print">
                        <h5 className="mb-0 fw-bold text-secondary">Utilization & Sharing Records ({filteredHistory.length})</h5>
                        <div className="d-flex gap-2">
                            <Button variant="outline-success" size="sm" onClick={exportToCSV}>
                                <FaFileCsv className="me-1" /> Export CSV
                            </Button>
                            <Button variant="outline-primary" size="sm" onClick={handlePrint}>
                                <FaPrint className="me-1" /> Print Report
                            </Button>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <h5 className="text-center text-muted py-5">Loading sharing history...</h5>
                        ) : filteredHistory.length === 0 ? (
                            <h5 className="text-center text-muted py-5">No utilization records match the selected parameters.</h5>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Equipment Info</th>
                                        <th>Requesting Institute</th>
                                        <th>Owning Institute</th>
                                        <th>Requested By</th>
                                        <th>Date & Hours</th>
                                        <th className="text-end">Utilization Cost</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((b) => (
                                        <tr key={b.bookingId}>
                                            <td>
                                                <div className="fw-bold text-primary">{b.equipment?.equipmentName}</div>
                                                <small className="text-muted">{b.equipment?.laboratory?.labName}</small>
                                            </td>
                                            <td>
                                                <Badge bg="dark" text="light">
                                                    {institutionsMap[b.user?.institutionId] || `Institute #${b.user?.institutionId}`}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg="secondary" text="light">
                                                    {b.equipment?.laboratory?.department?.institution?.institutionName || "N/A"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{b.user?.fullName}</div>
                                                <small className="text-muted">{b.user?.email}</small>
                                            </td>
                                            <td>
                                                <div>{b.bookingDate}</div>
                                                <small className="text-muted">{b.duration ? `${b.duration.toFixed(1)} hrs` : "N/A"} ({b.startTime} - {b.endTime})</small>
                                            </td>
                                            <td className="text-end fw-bold text-success">
                                                ₹{(b.utilizationCost || 0).toFixed(2)}
                                            </td>
                                            <td className="text-center">
                                                <Badge style={getStatusColorStyle(b.status)} className="p-2">
                                                    {b.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </DashboardLayout>
    );
}

// Inline helper for string checking
String.prototype.equalsIgnoreCase = function (anotherString) {
    return (anotherString != null && 
            typeof anotherString === 'string' && 
            this.toLowerCase() === anotherString.toLowerCase());
};

export default Reports;
