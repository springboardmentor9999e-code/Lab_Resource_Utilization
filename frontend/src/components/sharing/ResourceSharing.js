import React, { useEffect, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Table,
    Nav,
    Form,
    Modal,
    InputGroup
} from "react-bootstrap";
import {
    FaShareAlt,
    FaUniversity,
    FaLaptop,
    FaCheck,
    FaTimes,
    FaSearch,
    FaBuilding,
    FaFlask,
    FaInfoCircle,
    FaBan,
    FaChartBar
} from "react-icons/fa";
import DashboardLayout from "../dashboard/DashboardLayout";
import ConfirmationModal from "../common/ConfirmationModal";
import ResourceSharingAnalytics from "./ResourceSharingAnalytics";
import institutionService from "../../services/institutionService";
import {
    createSharingRequest,
    getIncomingRequests,
    getOutgoingRequests,
    getMyRequests,
    getAllRequests,
    getAvailableEquipmentForSharing,
    approveSharingRequest,
    rejectSharingRequest,
    cancelSharingRequest
} from "../../services/resourceSharingService";

function ResourceSharing() {
    const role = localStorage.getItem("role") || "STUDENT";
    const userInstId = localStorage.getItem("institutionId");
    const currentUserId = localStorage.getItem("userId");

    const isAuthority = ["INSTITUTION_ADMIN", "SYSTEM_ADMIN", "LAB_MANAGER"].includes(role);
    const isSystemAdmin = role === "SYSTEM_ADMIN";

    // Tab state
    const [activeTab, setActiveTab] = useState("available"); // 'available', 'incoming', 'outgoing', 'my-requests', 'all'
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    // Data states
    const [institutions, setInstitutions] = useState([]);
    const [selectedInstId, setSelectedInstId] = useState("");
    const [availableEquipment, setAvailableEquipment] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [allPlatformRequests, setAllPlatformRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    // Request Sharing Modal state
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [targetEquip, setTargetEquip] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");
    const [imgErrors, setImgErrors] = useState({});

    // Confirmation Modal state
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: "", message: "", action: null });

    // Reject Reason Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectTargetId, setRejectTargetId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");

    // View Details Modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailItem, setDetailItem] = useState(null);

    useEffect(() => {
        loadInstitutions();
        loadAllData();
        const intervalId = setInterval(loadAllData, 60000);
        return () => clearInterval(intervalId);
    }, [selectedInstId]);

    const loadInstitutions = async () => {
        try {
            const res = await institutionService.getAllInstitutions();
            setInstitutions(res.data || []);
        } catch (err) {
            console.error("Error loading institutions", err);
        }
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            // Load available equipment for sharing
            const equipRes = await getAvailableEquipmentForSharing(selectedInstId || null);
            setAvailableEquipment(equipRes.data || []);

            // Load user requests
            const myRes = await getMyRequests();
            setMyRequests(myRes.data || []);

            // Load outgoing requests
            const outRes = await getOutgoingRequests();
            setOutgoingRequests(outRes.data || []);

            // Load incoming requests if authority
            if (isAuthority) {
                const inRes = await getIncomingRequests();
                setIncomingRequests(inRes.data || []);
            }

            // Load all platform requests if system admin
            if (isSystemAdmin) {
                const allRes = await getAllRequests();
                setAllPlatformRequests(allRes.data || []);
            }
        } catch (err) {
            console.error("Error loading resource sharing data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleImgError = (id) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };

    // Calculate duration & cost safely
    const calculateCostDetails = (equip, start, end) => {
        const rate = (equip && equip.costPerHour && Number(equip.costPerHour) > 0) ? Number(equip.costPerHour) : 5.0;
        if (!start || !end) return { duration: 0, cost: 0, rate: rate };
        const [sH, sM] = start.split(":").map(Number);
        const [eH, eM] = end.split(":").map(Number);
        if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) {
            return { duration: 0, cost: 0, rate: rate };
        }
        const diffMins = (eH * 60 + eM) - (sH * 60 + sM);
        if (diffMins <= 0) return { duration: 0, cost: 0, rate: rate };
        const durationHrs = diffMins / 60.0;
        const cost = durationHrs * rate;
        return { duration: durationHrs, cost: cost, rate: rate };
    };

    const { duration: calcDuration = 0, cost: calcCost = 0, rate: calcRate = 5.0 } = calculateCostDetails(targetEquip, startTime, endTime);

    // Open Request Modal
    const handleOpenRequest = (equip) => {
        setTargetEquip(equip);
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        setPurpose("");
        setShowRequestModal(true);
    };

    // Submit Request Action
    const handleSubmitSharingRequest = async () => {
        if (!bookingDate || !startTime || !endTime) {
            alert("Please provide booking date, start time, and end time.");
            return;
        }

        const now = new Date();
        const selectedDateTime = new Date(`${bookingDate}T${startTime}`);
        if (selectedDateTime < now) {
            alert("Sharing request cannot be created for past dates or times.");
            return;
        }

        if (calcDuration <= 0) {
            alert("End time must be after start time.");
            return;
        }

        setConfirmConfig({
            title: "Confirm Inter-Institute Sharing Request",
            message: `Are you sure you want to submit a resource sharing request for ${targetEquip?.equipmentName || "equipment"}? Estimated External Utilization Cost: ₹${Number(calcCost || 0).toFixed(2)} (${Number(calcDuration || 0).toFixed(1)} hrs @ ₹${Number(calcRate || 5.0).toFixed(2)}/hr).`,
            action: async () => {
                try {
                    const payload = {
                        equipmentId: targetEquip.id,
                        ownerInstitutionId: targetEquip.laboratory?.department?.institution?.institutionId,
                        bookingDate: bookingDate,
                        startTime: startTime,
                        endTime: endTime,
                        purpose: purpose
                    };
                    await createSharingRequest(payload);
                    alert("Inter-institute sharing request submitted successfully. Awaiting approval from the owner institution.");
                    setShowRequestModal(false);
                    setActiveTab(isAuthority ? "outgoing" : "my-requests");
                    loadAllData();
                } catch (err) {
                    console.error("Error creating sharing request", err);
                    alert(err.response?.data?.message || err.message || "Failed to submit sharing request.");
                }
            }
        });
        setShowConfirm(true);
    };

    // Approve Action
    const handleApprove = (item) => {
        setConfirmConfig({
            title: "Approve Resource Sharing Request",
            message: `Are you sure you want to APPROVE sharing of ${item.equipment?.equipmentName} with ${item.sharedWithInstitution?.institutionName} on ${item.bookingDate}? This will confirm their booking reservation.`,
            action: async () => {
                try {
                    await approveSharingRequest(item.id);
                    alert("Resource sharing request approved and booking confirmed.");
                    loadAllData();
                } catch (err) {
                    console.error("Error approving request", err);
                    alert(err.response?.data?.message || "Failed to approve sharing request.");
                }
            }
        });
        setShowConfirm(true);
    };

    // Reject Action
    const handleOpenReject = (item) => {
        setRejectTargetId(item.id);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        try {
            await rejectSharingRequest(rejectTargetId, rejectReason || "Request declined by institution authority.");
            alert("Resource sharing request rejected.");
            setShowRejectModal(false);
            loadAllData();
        } catch (err) {
            console.error("Error rejecting request", err);
            alert("Failed to reject sharing request.");
        }
    };

    // Cancel Action
    const handleCancel = (item) => {
        setConfirmConfig({
            title: "Cancel Sharing Request",
            message: `Are you sure you want to cancel your sharing request for ${item.equipment?.equipmentName}?`,
            action: async () => {
                try {
                    await cancelSharingRequest(item.id);
                    alert("Sharing request cancelled.");
                    loadAllData();
                } catch (err) {
                    console.error("Error cancelling request", err);
                    alert("Failed to cancel sharing request.");
                }
            }
        });
        setShowConfirm(true);
    };

    // Status Badge & Color Helper
    const getStatusBadge = (status) => {
        if (!status) return <Badge bg="secondary">Unknown</Badge>;
        const s = status.toUpperCase();
        switch (s) {
            case "APPROVED":
            case "CONFIRMED":
                return <Badge bg="success" className="p-2">Approved</Badge>;
            case "ACTIVE":
            case "IN USE":
                return <Badge bg="info" className="p-2 text-white">Active</Badge>;
            case "PENDING":
                return <Badge bg="warning" text="dark" className="p-2">Pending</Badge>;
            case "REJECTED":
                return <Badge bg="danger" className="p-2">Rejected</Badge>;
            case "COMPLETED":
                return <Badge bg="secondary" className="p-2">Completed</Badge>;
            case "CANCELLED":
            case "CANCELED":
                return <Badge bg="dark" className="p-2">Cancelled</Badge>;
            case "EXPIRED":
                return <Badge bg="secondary" className="p-2">Expired</Badge>;
            default:
                return <Badge bg="light" text="dark" className="p-2">{status}</Badge>;
        }
    };

    // Filter current list
    const getFilteredList = (list) => {
        return list.filter(item => {
            if (statusFilter !== "ALL" && item.status && item.status.toUpperCase() !== statusFilter.toUpperCase()) {
                return false;
            }
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const eqName = item.equipment?.equipmentName?.toLowerCase() || "";
                const ownerInst = item.ownerInstitution?.institutionName?.toLowerCase() || "";
                const reqInst = item.sharedWithInstitution?.institutionName?.toLowerCase() || "";
                const userName = item.requestedBy?.fullName?.toLowerCase() || "";
                if (!eqName.includes(q) && !ownerInst.includes(q) && !reqInst.includes(q) && !userName.includes(q)) {
                    return false;
                }
            }
            return true;
        });
    };

    // Stats calculations
    const combinedRequests = isSystemAdmin ? allPlatformRequests : [...incomingRequests, ...outgoingRequests];
    const totalCount = combinedRequests.length;
    const pendingCount = combinedRequests.filter(r => r.status && r.status.toUpperCase() === "PENDING").length;
    const approvedCount = combinedRequests.filter(r => r.status && (r.status.toUpperCase() === "APPROVED" || r.status.toUpperCase() === "ACTIVE")).length;
    const rejectedCount = combinedRequests.filter(r => r.status && r.status.toUpperCase() === "REJECTED").length;
    const completedCount = combinedRequests.filter(r => r.status && r.status.toUpperCase() === "COMPLETED").length;

    return (
        <DashboardLayout title="Inter-Institute Resource Sharing">
            <Container fluid className="px-0">
                {/* Stats Summary */}
                <Row className="g-3 mb-4">
                    <Col md={2.4} sm={6} className="col-6 col-md">
                        <Card className="border-0 shadow-sm text-center py-2 bg-light">
                            <h5 className="mb-0 fw-bold text-dark">{totalCount}</h5>
                            <small className="text-muted">Total Requests</small>
                        </Card>
                    </Col>
                    <Col md={2.4} sm={6} className="col-6 col-md">
                        <Card className="border-0 shadow-sm text-center py-2 bg-warning bg-opacity-10">
                            <h5 className="mb-0 fw-bold text-warning">{pendingCount}</h5>
                            <small className="text-muted">Pending Approval</small>
                        </Card>
                    </Col>
                    <Col md={2.4} sm={6} className="col-6 col-md">
                        <Card className="border-0 shadow-sm text-center py-2 bg-success bg-opacity-10">
                            <h5 className="mb-0 fw-bold text-success">{approvedCount}</h5>
                            <small className="text-muted">Approved / Active</small>
                        </Card>
                    </Col>
                    <Col md={2.4} sm={6} className="col-6 col-md">
                        <Card className="border-0 shadow-sm text-center py-2 bg-secondary bg-opacity-10">
                            <h5 className="mb-0 fw-bold text-secondary">{completedCount}</h5>
                            <small className="text-muted">Completed</small>
                        </Card>
                    </Col>
                    <Col md={2.4} sm={6} className="col-6 col-md">
                        <Card className="border-0 shadow-sm text-center py-2 bg-danger bg-opacity-10">
                            <h5 className="mb-0 fw-bold text-danger">{rejectedCount}</h5>
                            <small className="text-muted">Rejected</small>
                        </Card>
                    </Col>
                </Row>

                {/* Main Navigation Card */}
                <Card className="shadow border-0 mb-4">
                    <Card.Header className="bg-white border-bottom pt-3 pb-0">
                        <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                            <Nav.Item>
                                <Nav.Link eventKey="available" className="d-flex align-items-center gap-2 fw-semibold">
                                    <FaLaptop className="text-primary" /> Browse External Equipment ({availableEquipment.length})
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="my-requests" className="d-flex align-items-center gap-2 fw-semibold">
                                    <FaShareAlt className="text-info" /> My Sharing Requests ({myRequests.length})
                                </Nav.Link>
                            </Nav.Item>
                            {isAuthority && (
                                <Nav.Item>
                                    <Nav.Link eventKey="incoming" className="d-flex align-items-center gap-2 fw-semibold">
                                        <FaUniversity className="text-success" /> Incoming Requests (For Approval) 
                                        {incomingRequests.filter(r => r.status === "Pending").length > 0 && (
                                            <Badge bg="danger" pill className="ms-1">
                                                {incomingRequests.filter(r => r.status === "Pending").length}
                                            </Badge>
                                        )}
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                            {isAuthority && (
                                <Nav.Item>
                                    <Nav.Link eventKey="outgoing" className="d-flex align-items-center gap-2 fw-semibold">
                                        <FaBuilding className="text-secondary" /> Institute Outgoing Requests ({outgoingRequests.length})
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                            {isSystemAdmin && (
                                <Nav.Item>
                                    <Nav.Link eventKey="all" className="d-flex align-items-center gap-2 fw-semibold">
                                        <FaFlask className="text-dark" /> Platform Global Matrix ({allPlatformRequests.length})
                                    </Nav.Link>
                                </Nav.Item>
                            )}
                            <Nav.Item>
                                <Nav.Link eventKey="analytics" className="d-flex align-items-center gap-2 fw-semibold">
                                    <FaChartBar className="text-warning" /> Analytics & Heatmap
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>

                    {/* Filter & Search Bar */}
                    {activeTab !== "analytics" && (
                        <Card.Body className="bg-light py-3 border-bottom">
                        <Row className="g-3 align-items-center justify-content-between">
                            <Col md={4}>
                                <InputGroup size="sm">
                                    <InputGroup.Text><FaSearch /></InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by equipment, institute, or user..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            {activeTab === "available" && (
                                <Col md={4}>
                                    <Form.Select
                                        size="sm"
                                        value={selectedInstId}
                                        onChange={(e) => setSelectedInstId(e.target.value)}
                                    >
                                        <option value="">All Partner Institutions</option>
                                        {institutions.map(inst => (
                                            <option key={inst.institutionId} value={inst.institutionId}>
                                                {inst.institutionName} ({inst.institutionCode})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            )}
                            {activeTab !== "available" && (
                                <Col md={6} className="d-flex gap-1 flex-wrap justify-content-end">
                                    {["ALL", "PENDING", "APPROVED", "ACTIVE", "COMPLETED", "REJECTED", "CANCELLED"].map(st => (
                                        <Button
                                            key={st}
                                            variant={statusFilter === st ? "primary" : "outline-secondary"}
                                            size="sm"
                                            className="px-2 py-1 text-uppercase"
                                            style={{ fontSize: "0.75rem" }}
                                            onClick={() => setStatusFilter(st)}
                                        >
                                            {st}
                                        </Button>
                                    ))}
                                </Col>
                            )}
                        </Row>
                    </Card.Body>
                    )}

                    {/* Tab Contents */}
                    <Card.Body className="p-4">
                        {/* 1. AVAILABLE EQUIPMENT TAB */}
                        {activeTab === "available" && (
                            <div>
                                {availableEquipment.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <FaLaptop size={50} className="text-muted mb-3 opacity-50" />
                                        <h5>No External Equipment Available for Sharing</h5>
                                        <p className="small">Try choosing another partner institution or check back later.</p>
                                    </div>
                                ) : (
                                    <Row className="g-4">
                                        {availableEquipment.map(item => {
                                            const ownerName = item.laboratory?.department?.institution?.institutionName || "External Institute";
                                            const labName = item.laboratory?.labName || "Laboratory";
                                            const rate = item.costPerHour && item.costPerHour > 0 ? item.costPerHour : 5.0;

                                            return (
                                                <Col lg={4} md={6} key={item.id}>
                                                    <Card className="h-100 shadow-sm border rounded hover-shadow transition">
                                                        <div className="text-center p-3 bg-light rounded-top d-flex align-items-center justify-content-center" style={{ height: "160px" }}>
                                                            {item.imageUrl && !imgErrors[item.id] ? (
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.equipmentName}
                                                                    style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }}
                                                                    onError={() => handleImgError(item.id)}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src="/images/equipment/placeholder.jpg"
                                                                    alt="Placeholder"
                                                                    style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }}
                                                                />
                                                            )}
                                                        </div>
                                                        <Card.Body className="d-flex flex-column justify-content-between">
                                                            <div>
                                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                                    <Badge bg="info" className="text-uppercase" style={{ fontSize: "0.7rem" }}>
                                                                        Shared from {ownerName}
                                                                    </Badge>
                                                                    <Badge bg="success" className="p-1">
                                                                        ₹{Number(rate || 5.0).toFixed(2)}/hr
                                                                    </Badge>
                                                                </div>
                                                                <Card.Title className="fw-bold text-primary mb-1">
                                                                    {item.equipmentName}
                                                                </Card.Title>
                                                                <p className="text-muted small mb-2">
                                                                    <strong>Lab:</strong> {labName} | <strong>Category:</strong> {item.category}
                                                                </p>
                                                                <p className="text-muted small mb-3" style={{ minHeight: "38px" }}>
                                                                    {item.description ? (item.description.length > 80 ? item.description.substring(0, 80) + "..." : item.description) : "No description available."}
                                                                </p>
                                                            </div>
                                                            <div className="pt-2 border-top d-flex gap-2">
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="w-100 d-flex align-items-center justify-content-center gap-1"
                                                                    onClick={() => handleOpenRequest(item)}
                                                                >
                                                                    <FaShareAlt size={12} /> Request Sharing / Book
                                                                </Button>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                )}
                            </div>
                        )}

                        {/* 2. REQUESTS TABLES (MY REQUESTS, INCOMING, OUTGOING, ALL) */}
                        {activeTab !== "available" && (
                            <div>
                                {(() => {
                                    let listToRender = [];
                                    if (activeTab === "my-requests") listToRender = myRequests;
                                    else if (activeTab === "incoming") listToRender = incomingRequests;
                                    else if (activeTab === "outgoing") listToRender = outgoingRequests;
                                    else if (activeTab === "all") listToRender = allPlatformRequests;

                                    const filtered = getFilteredList(listToRender);

                                    if (filtered.length === 0) {
                                        return (
                                            <div className="text-center py-5 text-muted">
                                                <FaShareAlt size={45} className="text-muted mb-3 opacity-50" />
                                                <h5>No Resource Sharing Requests Found</h5>
                                                <p className="small">No sharing records matching your selected filter criteria.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Table responsive striped hover className="align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Equipment</th>
                                                    <th>Owner Institute</th>
                                                    <th>Requesting Institute</th>
                                                    <th>Requestor</th>
                                                    <th>Booking Date & Slot</th>
                                                    <th>Duration</th>
                                                    <th>Ext. Cost</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filtered.map(req => {
                                                    const isPending = req.status && req.status.toUpperCase() === "PENDING";
                                                    const ownerInstId = req.ownerInstitution?.institutionId || req.equipment?.laboratory?.department?.institution?.institutionId;
                                                    const requestingInstId = req.sharedWithInstitution?.institutionId;
                                                    const requesterUserId = req.requestedBy?.userId;

                                                    // System Administrator has read-only monitoring access.
                                                    // Only the Owning Institution Administrator can approve or reject sharing requests.
                                                    const canApproveReject = isPending && !isSystemAdmin && role === "INSTITUTION_ADMIN" && (
                                                        ownerInstId && userInstId && String(ownerInstId) === String(userInstId)
                                                    );

                                                    // Requesting Institution Admin or original requester can cancel pending requests.
                                                    const canCancel = isPending && !isSystemAdmin && (
                                                        (requesterUserId && currentUserId && String(requesterUserId) === String(currentUserId)) ||
                                                        (requestingInstId && userInstId && String(requestingInstId) === String(userInstId) && role === "INSTITUTION_ADMIN")
                                                    );

                                                    return (
                                                        <tr key={req.id}>
                                                            <td>
                                                                <strong className="text-dark">{req.equipment?.equipmentName}</strong>
                                                                <br />
                                                                <small className="text-muted">{req.equipment?.laboratory?.labName}</small>
                                                            </td>
                                                            <td>
                                                                <Badge bg="secondary" text="light">
                                                                    {req.ownerInstitution?.institutionName}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Badge bg="info" text="dark">
                                                                    {req.sharedWithInstitution?.institutionName}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <span className="fw-semibold">{req.requestedBy?.fullName}</span>
                                                                <br />
                                                                <small className="text-muted">{req.requestedBy?.email}</small>
                                                            </td>
                                                            <td>
                                                                {req.bookingDate}
                                                                <br />
                                                                <small className="text-muted">{req.startTime} - {req.endTime}</small>
                                                            </td>
                                                            <td>{req.duration != null ? `${Number(req.duration || 0).toFixed(1)} hrs` : "N/A"}</td>
                                                            <td className="fw-bold text-success">
                                                                ₹{Number(req.estimatedCost || 0).toFixed(2)}
                                                            </td>
                                                            <td>{getStatusBadge(req.status)}</td>
                                                            <td className="text-center">
                                                                <div className="d-flex gap-1 justify-content-center flex-wrap">
                                                                    <Button
                                                                        variant="outline-info"
                                                                        size="sm"
                                                                        title="View Details"
                                                                        onClick={() => {
                                                                            setDetailItem(req);
                                                                            setShowDetailModal(true);
                                                                        }}
                                                                    >
                                                                        <FaInfoCircle />
                                                                    </Button>

                                                                    {/* Authority Approvals (Approve & Reject) */}
                                                                    {canApproveReject && (
                                                                        <>
                                                                            <Button
                                                                                variant="success"
                                                                                size="sm"
                                                                                className="d-flex align-items-center gap-1"
                                                                                onClick={() => handleApprove(req)}
                                                                            >
                                                                                <FaCheck size={10} /> Approve
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                className="d-flex align-items-center gap-1"
                                                                                onClick={() => handleOpenReject(req)}
                                                                            >
                                                                                <FaTimes size={10} /> Reject
                                                                            </Button>
                                                                        </>
                                                                    )}

                                                                    {/* Requester Cancel on Pending */}
                                                                    {canCancel && !canApproveReject && (
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => handleCancel(req)}
                                                                        >
                                                                            <FaBan size={10} className="me-1" /> Cancel
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    );
                                })()}
                            </div>
                        )}

                        {/* 6. ANALYTICS & HEATMAP TAB */}
                        {activeTab === "analytics" && (
                            <ResourceSharingAnalytics />
                        )}
                    </Card.Body>
                </Card>
            </Container>

            {/* 1. Request Sharing Modal */}
            <Modal show={showRequestModal} onHide={() => setShowRequestModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <FaShareAlt className="text-primary" />
                        <span>Request Inter-Institute Sharing</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {targetEquip && (
                        <div>
                            {/* Device & Owner Info Summary */}
                            <Card className="bg-light border-0 mb-3 p-3">
                                <Row>
                                    <Col md={8}>
                                        <h5 className="text-primary fw-bold mb-1">{targetEquip.equipmentName}</h5>
                                        <p className="text-muted small mb-1">
                                            <strong>Owner Institute:</strong> {targetEquip.laboratory?.department?.institution?.institutionName}
                                        </p>
                                        <p className="text-muted small mb-1">
                                            <strong>Laboratory:</strong> {targetEquip.laboratory?.labName} ({targetEquip.laboratory?.department?.departmentName})
                                        </p>
                                        <p className="text-muted small mb-0">
                                            <strong>Serial Number:</strong> {targetEquip.serialNumber || "N/A"}
                                        </p>
                                    </Col>
                                    <Col md={4} className="text-end">
                                        <div className="p-2 rounded bg-white border text-center">
                                            <small className="text-muted d-block">External Rate</small>
                                            <strong className="text-success fs-5">₹{Number(calcRate || 5.0).toFixed(2)}/hr</strong>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            <Form>
                                <Row className="g-3 mb-3">
                                    <Col md={4}>
                                        <Form.Label className="fw-semibold small">Booking Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={bookingDate}
                                            min={new Date().toISOString().split("T")[0]}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="fw-semibold small">Start Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="fw-semibold small">End Time</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold small">Purpose of Sharing / Project Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Describe academic/research purpose for using this external resource..."
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                    />
                                </Form.Group>

                                {/* Cost Calculation Box */}
                                <Card className="border border-success bg-success bg-opacity-10 p-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-0 fw-bold text-success">Estimated Utilization Cost</h6>
                                            <small className="text-muted">
                                                Duration: {Number(calcDuration || 0).toFixed(1)} hrs × ₹{Number(calcRate || 5.0).toFixed(2)}/hr
                                            </small>
                                        </div>
                                        <h4 className="mb-0 fw-bold text-success">₹{Number(calcCost || 0).toFixed(2)}</h4>
                                    </div>
                                </Card>
                            </Form>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" size="sm" onClick={() => setShowRequestModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSubmitSharingRequest}>
                        Submit Sharing Request
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 2. Reject Reason Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="text-danger fs-5">Reject Resource Sharing Request</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label className="fw-semibold small">Rejection Reason</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter reason for declining this sharing request..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="secondary" size="sm" onClick={() => setShowRejectModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                        Confirm Rejection
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 3. Detail View Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fs-5">Sharing Request Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {detailItem && (
                        <div className="d-flex flex-column gap-3">
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-light">
                                        <h6 className="text-primary fw-bold mb-2">Equipment Information</h6>
                                        <p className="mb-1 small"><strong>Name:</strong> {detailItem.equipment?.equipmentName}</p>
                                        <p className="mb-1 small"><strong>Category:</strong> {detailItem.equipment?.category}</p>
                                        <p className="mb-1 small"><strong>Owner Institute:</strong> {detailItem.ownerInstitution?.institutionName}</p>
                                        <p className="mb-1 small"><strong>Laboratory:</strong> {detailItem.equipment?.laboratory?.labName}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="p-3 border rounded bg-light">
                                        <h6 className="text-primary fw-bold mb-2">Reservation & Cost</h6>
                                        <p className="mb-1 small"><strong>Date:</strong> {detailItem.bookingDate}</p>
                                        <p className="mb-1 small"><strong>Time Slot:</strong> {detailItem.startTime} - {detailItem.endTime}</p>
                                        <p className="mb-1 small"><strong>Duration:</strong> {detailItem.duration != null ? `${Number(detailItem.duration || 0).toFixed(1)} hrs` : "N/A"}</p>
                                        <p className="mb-1 small"><strong>Hourly Rate:</strong> ₹{Number(detailItem.hourlyRate || 5.0).toFixed(2)}/hr</p>
                                        <p className="mb-1 small"><strong>Total Cost:</strong> ₹{Number(detailItem.estimatedCost || 0).toFixed(2)}</p>
                                    </div>
                                </Col>
                            </Row>

                            <div className="p-3 border rounded bg-white">
                                <h6 className="fw-bold mb-2">Parties Involved</h6>
                                <p className="mb-1 small"><strong>Requesting Institute:</strong> {detailItem.sharedWithInstitution?.institutionName}</p>
                                <p className="mb-1 small"><strong>Requested By:</strong> {detailItem.requestedBy?.fullName} ({detailItem.requestedBy?.email})</p>
                                <p className="mb-1 small"><strong>Request Date:</strong> {detailItem.requestDate}</p>
                                {detailItem.approvedBy && (
                                    <p className="mb-1 small"><strong>Actioned By:</strong> {detailItem.approvedBy?.fullName} on {detailItem.approvalDate}</p>
                                )}
                                {detailItem.purpose && (
                                    <p className="mb-1 small mt-2"><strong>Purpose:</strong> {detailItem.purpose}</p>
                                )}
                                {detailItem.rejectionReason && (
                                    <p className="mb-1 small text-danger mt-2"><strong>Rejection Reason:</strong> {detailItem.rejectionReason}</p>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light d-flex justify-content-between">
                    <div>
                        {detailItem && detailItem.status && detailItem.status.toUpperCase() === "PENDING" && (() => {
                            const ownerInstId = detailItem.ownerInstitution?.institutionId || detailItem.equipment?.laboratory?.department?.institution?.institutionId;
                            const requestingInstId = detailItem.sharedWithInstitution?.institutionId;
                            const requesterUserId = detailItem.requestedBy?.userId;

                            const canApproveReject = !isSystemAdmin && role === "INSTITUTION_ADMIN" && (
                                ownerInstId && userInstId && String(ownerInstId) === String(userInstId)
                            );

                            const canCancel = !isSystemAdmin && (
                                (requesterUserId && currentUserId && String(requesterUserId) === String(currentUserId)) ||
                                (requestingInstId && userInstId && String(requestingInstId) === String(userInstId) && role === "INSTITUTION_ADMIN")
                            );

                            return (
                                <div className="d-flex gap-2">
                                    {canApproveReject && (
                                        <>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                className="d-flex align-items-center gap-1"
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    handleApprove(detailItem);
                                                }}
                                            >
                                                <FaCheck size={12} /> Approve Request
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="d-flex align-items-center gap-1"
                                                onClick={() => {
                                                    setShowDetailModal(false);
                                                    handleOpenReject(detailItem);
                                                }}
                                            >
                                                <FaTimes size={12} /> Reject Request
                                            </Button>
                                        </>
                                    )}
                                    {canCancel && !canApproveReject && (
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="d-flex align-items-center gap-1"
                                            onClick={() => {
                                                setShowDetailModal(false);
                                                handleCancel(detailItem);
                                            }}
                                        >
                                            <FaBan size={12} /> Cancel Request
                                        </Button>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* 4. Reusable Confirmation Modal */}
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

export default ResourceSharing;
