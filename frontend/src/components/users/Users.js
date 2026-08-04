import React, { useEffect, useState } from "react";
import { Table, Badge, Card, Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { FaUsers, FaLaptop, FaSearch, FaEnvelope, FaPhone, FaCheckCircle, FaTimesCircle, FaUserShield } from "react-icons/fa";
import axios from "axios";
import { getPendingUsers, approveUser, rejectUser } from "../../services/adminService";
import DashboardLayout from "../dashboard/DashboardLayout";

function Users() {
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    // Maps for institution and department ID to Name
    const [instMap, setInstMap] = useState({});
    const [deptMap, setDeptMap] = useState({});
    
    const role = localStorage.getItem("role");

    const loadData = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch mapping information
            const instRes = await axios.get("http://localhost:8080/api/institutions", { headers });
            const deptRes = await axios.get("http://localhost:8080/api/departments", { headers });

            const iMap = {};
            instRes.data.forEach(i => {
                iMap[i.institutionId] = i.institutionName;
            });
            const dMap = {};
            deptRes.data.forEach(d => {
                dMap[d.departmentId] = d.departmentName;
            });
            setInstMap(iMap);
            setDeptMap(dMap);

            // 1. Fetch current user profile first to get department/institution filters
            const profileRes = await axios.get("http://localhost:8080/api/profile", { headers });
            const userProfile = profileRes.data;

            // 2. Fetch all users
            const usersRes = await axios.get("http://localhost:8080/api/admin/users", { headers });
            let userList = usersRes.data;

            // 3. Fetch all bookings
            const bookingsRes = await axios.get("http://localhost:8080/api/bookings", { headers });
            let bookingList = bookingsRes.data;

            // 4. Fetch pending users if role is SYSTEM_ADMIN or INSTITUTION_ADMIN
            let pendingList = [];
            if (role === "SYSTEM_ADMIN" || role === "INSTITUTION_ADMIN") {
                const pendingRes = await getPendingUsers();
                pendingList = pendingRes.data;
            }

            // Apply role-based filtering
            if (role === "INSTITUTION_ADMIN") {
                userList = userList.filter(u => u.institutionId === userProfile.institutionId);
                bookingList = bookingList.filter(b => b.equipment?.laboratory?.department?.institution?.institutionId === userProfile.institutionId);
                pendingList = pendingList.filter(u => u.institutionId === userProfile.institutionId);
            } else if (role === "DEPARTMENT_HEAD" || role === "LAB_MANAGER" || role === "LAB_TECHNICIAN") {
                userList = userList.filter(u => u.departmentId === userProfile.departmentId);
                bookingList = bookingList.filter(b => b.equipment?.laboratory?.department?.departmentId === userProfile.departmentId);
            }

            setUsers(userList);
            setBookings(bookingList);
            setPendingUsers(pendingList);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user management data", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = async (userId) => {
        try {
            await approveUser(userId);
            alert("User approved successfully!");
            loadData();
        } catch (error) {
            console.error("Error approving user", error);
            alert("Failed to approve user.");
        }
    };

    const handleReject = async (userId) => {
        if (!window.confirm("Are you sure you want to reject and block this user's registration?")) {
            return;
        }
        try {
            await rejectUser(userId);
            alert("User rejected successfully.");
            loadData();
        } catch (error) {
            console.error("Error rejecting user", error);
            alert("Failed to reject user.");
        }
    };

    // Filtered lists
    const activeAllocations = bookings.filter(b => "In Use".equalsIgnoreCase(b.status));

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "" || (user.role && user.role.roleName === roleFilter);
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeBg = (roleName) => {
        if ("SYSTEM_ADMIN".equalsIgnoreCase(roleName)) return "danger";
        if ("INSTITUTION_ADMIN".equalsIgnoreCase(roleName)) return "warning text-dark";
        if ("LAB_MANAGER".equalsIgnoreCase(roleName)) return "primary";
        if ("DEPARTMENT_HEAD".equalsIgnoreCase(roleName)) return "success";
        if ("RESEARCHER".equalsIgnoreCase(roleName)) return "info text-dark";
        return "secondary";
    };

    return (
        <DashboardLayout title="User Management & Status directory">
            <Container fluid className="px-0">
                {/* Banner summary */}
                <Card className="shadow border-0 mb-4 bg-light">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            Monitor the active checkouts, see which equipment is currently in use by which user, and lookup contact information in the department user directory.
                        </p>
                    </Card.Body>
                </Card>

                {/* Section 1: Pending Approvals (Visible only to System Admin & Institution Admin) */}
                {(role === "SYSTEM_ADMIN" || role === "INSTITUTION_ADMIN") && pendingUsers.length > 0 && (
                    <Card className="shadow border-0 mb-4 border-warning">
                        <Card.Header className="bg-warning text-dark py-3">
                            <h5 className="mb-0 fw-bold d-flex align-items-center">
                                <FaUserShield className="me-2" /> Pending Registry Registrations Approval ({pendingUsers.length})
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact</th>
                                        <th>Requested Role</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingUsers.map((pending) => (
                                        <tr key={pending.userId}>
                                            <td>
                                                <strong>{pending.fullName}</strong>
                                                {!["STUDENT", "RESEARCHER"].includes(pending.role?.roleName) && (
                                                    <div className="text-muted small mt-1">
                                                        <span>{instMap[pending.institutionId] || "Global"}</span>
                                                        {pending.departmentId && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span>{deptMap[pending.departmentId] || "All Departments"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{pending.email}</div>
                                                <small className="text-muted">{pending.phone}</small>
                                            </td>
                                            <td>
                                                <Badge bg={getRoleBadgeBg(pending.role?.roleName)} className="p-2">
                                                    {pending.role?.roleName}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Badge bg="warning" text="dark">
                                                    {pending.status}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex gap-2 justify-content-center">
                                                    <Button 
                                                        variant="success" 
                                                        size="sm" 
                                                        onClick={() => handleApprove(pending.userId)}
                                                    >
                                                        <FaCheckCircle className="me-1" /> Approve
                                                    </Button>
                                                    <Button 
                                                        variant="danger" 
                                                        size="sm" 
                                                        onClick={() => handleReject(pending.userId)}
                                                    >
                                                        <FaTimesCircle className="me-1" /> Reject
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                )}

                {/* Section 2: Active Equipment Allocations */}
                <Card className="shadow border-0 mb-4">
                    <Card.Header className="bg-primary text-white py-3">
                        <h5 className="mb-0 fw-bold d-flex align-items-center">
                            <FaLaptop className="me-2" /> Active Equipment Allocations (In Use)
                        </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {loading ? (
                            <p className="text-center text-muted py-5">Loading current active sessions...</p>
                        ) : activeAllocations.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <h5>No Equipment Currently In Use</h5>
                                <p className="mb-0 small">Active sessions will be shown here when booked slots start.</p>
                            </div>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Equipment Info</th>
                                        <th>Laboratory</th>
                                        <th>Checked Out By</th>
                                        <th>Time Slot</th>
                                        <th>Duration</th>
                                        <th>Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeAllocations.map((b) => (
                                        <tr key={b.bookingId}>
                                            <td>
                                                <strong className="text-primary">{b.equipment?.equipmentName}</strong>
                                                <br />
                                                <small className="text-muted">Serial: {b.equipment?.serialNumber} | Category: {b.equipment?.category}</small>
                                            </td>
                                            <td>{b.equipment?.laboratory?.labName}</td>
                                            <td>
                                                <div className="fw-bold">{b.user?.fullName}</div>
                                                <Badge bg={getRoleBadgeBg(b.user?.role?.roleName)} className="small">
                                                    {b.user?.role?.roleName}
                                                </Badge>
                                                {!["STUDENT", "RESEARCHER"].includes(b.user?.role?.roleName) && (
                                                    <div className="text-muted small mt-1">
                                                        <span>{instMap[b.user?.institutionId] || "Global"}</span>
                                                        {b.user?.departmentId && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span>{deptMap[b.user?.departmentId] || "All Departments"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{b.bookingDate}</div>
                                                <small className="text-muted">{b.startTime} - {b.endTime}</small>
                                            </td>
                                            <td>{b.duration ? `${b.duration.toFixed(1)} hrs` : "N/A"}</td>
                                            <td>
                                                <div className="small d-flex flex-column gap-1">
                                                    <span className="d-flex align-items-center text-muted"><FaEnvelope className="me-1" /> {b.user?.email}</span>
                                                    {b.user?.phone && <span className="d-flex align-items-center text-muted"><FaPhone className="me-1" /> {b.user?.phone}</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                {/* Section 3: Platform Users Directory */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-bold d-flex align-items-center">
                        <FaUsers className="me-2" /> Users Directory ({filteredUsers.length})
                    </h5>
                </div>

                <Card className="shadow border-0 mb-4">
                    <Card.Body className="pb-0">
                        <Row className="g-3 mb-3">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-end-0">
                                        <FaSearch className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search users by name, email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border-start-0 ps-0"
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <Form.Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="">Filter by Role</option>
                                    <option value="STUDENT">STUDENT</option>
                                    <option value="RESEARCHER">RESEARCHER</option>
                                    <option value="LAB_MANAGER">LAB_MANAGER</option>
                                    <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
                                    <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</option>
                                    <option value="INSTITUTION_ADMIN">INSTITUTION_ADMIN</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                    <Card.Body className="p-0">
                        {loading ? (
                            <p className="text-center text-muted py-5">Loading users directory...</p>
                        ) : filteredUsers.length === 0 ? (
                            <p className="text-center text-muted py-5 mb-0">No users found.</p>
                        ) : (
                            <Table striped hover responsive className="mb-0 align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact Info</th>
                                        <th>Role</th>
                                        <th>Roll Number / Research ID</th>
                                        <th>Registration Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.userId}>
                                            <td>
                                                <strong>{user.fullName}</strong>
                                                {!["STUDENT", "RESEARCHER"].includes(user.role?.roleName) && (
                                                    <div className="text-muted small mt-1">
                                                        <span>{instMap[user.institutionId] || "Global"}</span>
                                                        {user.departmentId && (
                                                            <>
                                                                <span className="mx-1">•</span>
                                                                <span>{deptMap[user.departmentId] || "All Departments"}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div>{user.email}</div>
                                                <small className="text-muted">{user.phone}</small>
                                            </td>
                                            <td>
                                                <Badge bg={getRoleBadgeBg(user.role?.roleName)} className="p-2">
                                                    {user.role?.roleName}
                                                </Badge>
                                            </td>
                                            <td>{user.rollNumber || user.researchId || <span className="text-muted small">N/A</span>}</td>
                                            <td>{user.registrationDate}</td>
                                            <td>
                                                <Badge bg={user.status === "ACTIVE" ? "success" : "warning"}>
                                                    {user.status}
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

export default Users;
