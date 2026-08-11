import React, { useEffect, useState } from "react";
import { Row, Col, Card, Form, Button, Table, Badge, Spinner } from "react-bootstrap";
import {
    FaChartBar,
    FaCalendarAlt,
    FaFilter,
    FaFire,
    FaExchangeAlt,
    FaDollarSign,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSync
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { getSharingAnalytics } from "../../services/resourceSharingService";
import institutionService from "../../services/institutionService";
import departmentService from "../../services/departmentService";
import { getAllLaboratories } from "../../services/laboratoryService";
import { getAllEquipment } from "../../services/equipmentService";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function ResourceSharingAnalytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [timeframe, setTimeframe] = useState("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedInst, setSelectedInst] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedLab, setSelectedLab] = useState("");
    const [selectedEquip, setSelectedEquip] = useState("");

    // Entity lists for dropdown filters
    const [institutions, setInstitutions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [laboratories, setLaboratories] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    useEffect(() => {
        loadFilterEntities();
        fetchAnalytics();
    }, []);

    const loadFilterEntities = async () => {
        try {
            const [instRes, deptRes, labRes, eqRes] = await Promise.allSettled([
                institutionService.getAllInstitutions(),
                departmentService.getAllDepartments(),
                getAllLaboratories(),
                getAllEquipment()
            ]);

            if (instRes.status === "fulfilled") setInstitutions(instRes.value.data || []);
            if (deptRes.status === "fulfilled") setDepartments(deptRes.value.data || []);
            if (labRes.status === "fulfilled") setLaboratories(labRes.value.data || []);
            if (eqRes.status === "fulfilled") setEquipmentList(eqRes.value.data || []);
        } catch (err) {
            console.error("Error loading filter master data", err);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = {
                timeframe,
                startDate: timeframe === "custom" && startDate ? startDate : undefined,
                endDate: timeframe === "custom" && endDate ? endDate : undefined,
                institutionId: selectedInst ? selectedInst : undefined,
                departmentId: selectedDept ? selectedDept : undefined,
                laboratoryId: selectedLab ? selectedLab : undefined,
                equipmentId: selectedEquip ? selectedEquip : undefined
            };

            const res = await getSharingAnalytics(params);
            setAnalyticsData(res.data);
        } catch (err) {
            console.error("Error fetching sharing analytics", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = (e) => {
        if (e) e.preventDefault();
        fetchAnalytics();
    };

    const handleResetFilters = () => {
        setTimeframe("month");
        setStartDate("");
        setEndDate("");
        setSelectedInst("");
        setSelectedDept("");
        setSelectedLab("");
        setSelectedEquip("");
        setTimeout(() => fetchAnalytics(), 50);
    };

    // Chart 1: Institute Flow Chart (Inflow vs Outflow)
    const instituteFlowChartData = {
        labels: (analyticsData?.sharesByInstitute || []).map(i => i.instituteName),
        datasets: [
            {
                label: "Equipment Lent (Outflow)",
                data: (analyticsData?.sharesByInstitute || []).map(i => i.outflowCount),
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: "Equipment Borrowed (Inflow)",
                data: (analyticsData?.sharesByInstitute || []).map(i => i.inflowCount),
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    // Chart 2: Monthly Trends
    const monthlyTrendsChartData = {
        labels: (analyticsData?.monthlyTrends || []).map(m => m.month),
        datasets: [
            {
                label: "Total Requests",
                data: (analyticsData?.monthlyTrends || []).map(m => m.requests),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: "Approved Requests",
                data: (analyticsData?.monthlyTrends || []).map(m => m.approved),
                backgroundColor: "rgba(40, 167, 69, 0.7)",
                borderColor: "rgba(40, 167, 69, 1)",
                borderWidth: 1,
                borderRadius: 4
            },
            {
                label: "Rejected Requests",
                data: (analyticsData?.monthlyTrends || []).map(m => m.rejected),
                backgroundColor: "rgba(220, 53, 69, 0.7)",
                borderColor: "rgba(220, 53, 69, 1)",
                borderWidth: 1,
                borderRadius: 4
            }
        ]
    };

    // Chart 3: Status Breakdown Doughnut
    const statusDoughnutData = {
        labels: (analyticsData?.statusBreakdown || []).map(s => s.status),
        datasets: [
            {
                data: (analyticsData?.statusBreakdown || []).map(s => s.count),
                backgroundColor: [
                    "rgba(40, 167, 69, 0.8)",
                    "rgba(255, 193, 7, 0.8)",
                    "rgba(220, 53, 69, 0.8)",
                    "rgba(23, 162, 184, 0.8)",
                    "rgba(108, 117, 125, 0.8)",
                    "rgba(52, 58, 64, 0.8)"
                ],
                borderWidth: 1
            }
        ]
    };

    // Heatmap helpers
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const slots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];

    const getHeatmapCount = (day, slot) => {
        if (!analyticsData?.activityHeatmap) return 0;
        const item = analyticsData.activityHeatmap.find(h => h.dayOfWeek === day && h.hourSlot === slot);
        return item ? item.count : 0;
    };

    const getHeatmapColor = (count) => {
        if (count === 0) return "#f8f9fa";
        if (count === 1) return "#c6f6d5"; // very light green
        if (count === 2) return "#68d391"; // light green
        if (count === 3) return "#38a169"; // medium green
        return "#22543d"; // dark green
    };

    const getHeatmapTextColor = (count) => {
        return count >= 3 ? "#ffffff" : "#2d3748";
    };

    return (
        <div className="resource-sharing-analytics">
            {/* Filter Section */}
            <Card className="shadow-sm border-0 mb-4 bg-light">
                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                        <FaFilter className="text-primary" /> Analytics & Intelligence Filters
                    </h6>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={handleResetFilters}>
                            <FaSync className="me-1" /> Reset
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="pt-2">
                    <Row className="g-3">
                        <Col md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Timeframe</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value)}
                                >
                                    <option value="day">Today (Day)</option>
                                    <option value="week">Past 7 Days (Week)</option>
                                    <option value="month">Past 30 Days (Month)</option>
                                    <option value="year">Past 12 Months (Year)</option>
                                    <option value="custom">Custom Date Range</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {timeframe === "custom" && (
                            <>
                                <Col md={3} sm={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted">Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3} sm={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-semibold text-muted">End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}

                        <Col md={timeframe === "custom" ? 3 : 3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Partner Institution</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={selectedInst}
                                    onChange={(e) => setSelectedInst(e.target.value)}
                                >
                                    <option value="">All Partner Institutions</option>
                                    {institutions.map(inst => (
                                        <option key={inst.institutionId} value={inst.institutionId}>
                                            {inst.institutionName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Department</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept.departmentId} value={dept.departmentId}>
                                            {dept.departmentName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Laboratory</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={selectedLab}
                                    onChange={(e) => setSelectedLab(e.target.value)}
                                >
                                    <option value="">All Laboratories</option>
                                    {laboratories.map(lab => (
                                        <option key={lab.labId} value={lab.labId}>
                                            {lab.labName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3} sm={6}>
                            <Form.Group>
                                <Form.Label className="small fw-semibold text-muted">Equipment</Form.Label>
                                <Form.Select
                                    size="sm"
                                    value={selectedEquip}
                                    onChange={(e) => setSelectedEquip(e.target.value)}
                                >
                                    <option value="">All Equipment</option>
                                    {equipmentList.map(eq => (
                                        <option key={eq.id} value={eq.id}>
                                            {eq.equipmentName}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Calculating real-time resource sharing intelligence...</p>
                </div>
            ) : (
                <>
                    {/* Summary KPI Cards */}
                    <Row className="g-3 mb-4">
                        <Col md={3} sm={6}>
                            <Card className="shadow-sm border-0 h-100 bg-white">
                                <Card.Body className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-3">
                                        <FaChartBar size={28} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-dark">{analyticsData?.totalRequests || 0}</h3>
                                        <small className="text-muted fw-semibold">Total Sharing Requests</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="shadow-sm border-0 h-100 bg-white">
                                <Card.Body className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-success bg-opacity-10 text-success rounded-3">
                                        <FaCheckCircle size={28} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-success">{analyticsData?.approvedRequests || 0}</h3>
                                        <small className="text-muted fw-semibold">Approved ({analyticsData?.approvalRate || 0}%)</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="shadow-sm border-0 h-100 bg-white">
                                <Card.Body className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-info bg-opacity-10 text-info rounded-3">
                                        <FaClock size={28} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-info">{(analyticsData?.totalDurationHours || 0).toFixed(1)} <small className="h6">hrs</small></h3>
                                        <small className="text-muted fw-semibold">Total Sharing Duration</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3} sm={6}>
                            <Card className="shadow-sm border-0 h-100 bg-white">
                                <Card.Body className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-3">
                                        <FaDollarSign size={28} />
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0 text-warning">₹{(analyticsData?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h3>
                                        <small className="text-muted fw-semibold">Estimated Cost / Revenue</small>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Chart Row 1: Flow by Institute & Monthly Trends */}
                    <Row className="g-4 mb-4">
                        <Col lg={7}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <FaExchangeAlt className="text-primary" /> Equipment Shared by Institute (Inflow vs Outflow)
                                    </h6>
                                    <small className="text-muted">Lent (Owned equipment shared out) vs Borrowed (External equipment requested)</small>
                                </Card.Header>
                                <Card.Body>
                                    {(analyticsData?.sharesByInstitute || []).length === 0 ? (
                                        <p className="text-center text-muted py-5 mb-0">No cross-institute activity logged in this period.</p>
                                    ) : (
                                        <div style={{ width: "100%", height: "260px" }}>
                                            <Bar data={instituteFlowChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={5}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
                                        <FaCalendarAlt className="text-success" /> Sharing Requests by Month
                                    </h6>
                                    <small className="text-muted">Historical request volume and approval outcomes</small>
                                </Card.Header>
                                <Card.Body>
                                    {(analyticsData?.monthlyTrends || []).length === 0 ? (
                                        <p className="text-center text-muted py-5 mb-0">No monthly trends recorded.</p>
                                    ) : (
                                        <div style={{ width: "100%", height: "260px" }}>
                                            <Bar data={monthlyTrendsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Activity Heatmap Section */}
                    <Card className="shadow-sm border-0 mb-4 bg-white">
                        <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0 fw-bold d-flex align-items-center gap-2 text-danger">
                                    <FaFire /> Resource Sharing Activity Heatmap
                                </h6>
                                <small className="text-muted">High-density time slots when equipment is requested or shared across institutions</small>
                            </div>
                            <div className="d-flex align-items-center gap-2 small">
                                <span className="text-muted">Intensity:</span>
                                <span className="badge border" style={{ backgroundColor: "#f8f9fa", color: "#333" }}>0</span>
                                <span className="badge" style={{ backgroundColor: "#c6f6d5", color: "#333" }}>1</span>
                                <span className="badge" style={{ backgroundColor: "#68d391", color: "#333" }}>2</span>
                                <span className="badge text-white" style={{ backgroundColor: "#38a169" }}>3</span>
                                <span className="badge text-white" style={{ backgroundColor: "#22543d" }}>4+</span>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table bordered hover className="mb-0 text-center align-middle" style={{ fontSize: "0.85rem" }}>
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "130px" }} className="text-start ps-3">Day / Time Slot</th>
                                            {slots.map(s => (
                                                <th key={s}>{s}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {days.map(day => (
                                            <tr key={day}>
                                                <td className="fw-bold text-start ps-3 bg-light">{day}</td>
                                                {slots.map(slot => {
                                                    const count = getHeatmapCount(day, slot);
                                                    return (
                                                        <td
                                                            key={slot}
                                                            style={{
                                                                backgroundColor: getHeatmapColor(count),
                                                                color: getHeatmapTextColor(count),
                                                                transition: "all 0.2s"
                                                            }}
                                                            className="fw-bold py-3"
                                                            title={`${day} @ ${slot}: ${count} sharing booking(s)`}
                                                        >
                                                            {count > 0 ? `${count} req` : "-"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Most Frequently Shared Equipment & Duration */}
                    <Row className="g-4 mb-4">
                        <Col lg={7}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 fw-bold">Most Frequently Shared Equipment</h6>
                                    <small className="text-muted">Top instruments utilized across institutional boundaries</small>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    {(analyticsData?.mostFrequentlySharedEquipment || []).length === 0 ? (
                                        <p className="text-center text-muted py-4 mb-0">No equipment share records found.</p>
                                    ) : (
                                        <Table responsive hover className="mb-0 align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Equipment Name</th>
                                                    <th>Category</th>
                                                    <th className="text-center">Times Shared</th>
                                                    <th className="text-end pe-3">Total Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analyticsData.mostFrequentlySharedEquipment.map((eq, idx) => (
                                                    <tr key={idx}>
                                                        <td><strong>{eq.equipmentName}</strong></td>
                                                        <td><Badge bg="secondary">{eq.category}</Badge></td>
                                                        <td className="text-center"><Badge bg="primary">{eq.count}</Badge></td>
                                                        <td className="text-end pe-3"><strong>{(eq.totalHours || 0).toFixed(1)} hrs</strong></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={5}>
                            <Card className="shadow-sm border-0 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 fw-bold">Sharing Duration Breakdown</h6>
                                    <small className="text-muted">Distribution by session length</small>
                                </Card.Header>
                                <Card.Body>
                                    <div className="d-flex flex-column gap-3">
                                        {(analyticsData?.durationDistribution || []).map((dur, i) => (
                                            <div key={i}>
                                                <div className="d-flex justify-content-between small fw-bold mb-1">
                                                    <span>{dur.range}</span>
                                                    <span>{dur.count} sessions</span>
                                                </div>
                                                <div className="progress" style={{ height: "10px" }}>
                                                    <div
                                                        className="progress-bar bg-info"
                                                        role="progressbar"
                                                        style={{
                                                            width: `${analyticsData.totalRequests > 0 ? (dur.count / analyticsData.totalRequests) * 100 : 0}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <hr />
                                    <h6 className="fw-bold mb-2 small text-muted">Status Breakdown</h6>
                                    <div style={{ height: "160px" }}>
                                        <Doughnut data={statusDoughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Institute-to-Institute Routes Table */}
                    <Card className="shadow-sm border-0 mb-4 bg-white">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 fw-bold">Inter-Institute Sharing Routes & Billing Overview</h6>
                            <small className="text-muted">Origin owner institution to destination requesting institution</small>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {(analyticsData?.instituteComparison || []).length === 0 ? (
                                <p className="text-center text-muted py-4 mb-0">No cross-institute route data logged.</p>
                            ) : (
                                <Table responsive hover className="mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Source (Owner Institute)</th>
                                            <th>Target (Requesting Institute)</th>
                                            <th className="text-center">Total Requests</th>
                                            <th className="text-end pe-4">Estimated Revenue (₹)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.instituteComparison.map((r, i) => (
                                            <tr key={i}>
                                                <td><strong className="text-primary">{r.sourceInstitute}</strong></td>
                                                <td><strong className="text-success">{r.targetInstitute}</strong></td>
                                                <td className="text-center"><Badge bg="dark">{r.count}</Badge></td>
                                                <td className="text-end pe-4"><strong>₹{(r.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}
        </div>
    );
}

export default ResourceSharingAnalytics;
