import React, { useState, useEffect } from "react";
import "../App.css";
import { FaBell, FaSearch, FaUserCircle, FaCheck, FaTools, FaCalendarCheck, FaFileAlt, FaUserShield, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Badge, ListGroup } from "react-bootstrap";
import notificationService from "../services/notificationService";

function Navbar() {
  const fullName = localStorage.getItem("fullName");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const fetchUnreadCount = async () => {
    try {
      if (localStorage.getItem("token")) {
        const res = await notificationService.getUnreadCount();
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Error fetching unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (localStorage.getItem("token")) {
        const res = await notificationService.getNotifications();
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchNotifications();
    }
  }, [showModal]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read && !n.isRead) {
      handleMarkAsRead(n.id);
    }
    setShowModal(false);

    const isStudentOrResearcher = ["STUDENT", "RESEARCHER"].includes(role);
    const cat = n.category ? n.category.toUpperCase() : "";
    const titleText = (n.title || "").toUpperCase();
    const msgText = (n.message || "").toUpperCase();

    if (titleText.includes("SHARING") || msgText.includes("SHARING") || msgText.includes("INTER-INSTITUTE")) {
      navigate("/resource-sharing");
    } else if (cat === "BOOKING") {
      if (isStudentOrResearcher) {
        navigate("/my-bookings");
      } else {
        navigate("/bookings");
      }
    } else if (cat === "MAINTENANCE" || 
               cat === "CALIBRATION" || 
               cat === "LICENSE_RENEWAL" || 
               cat === "CERTIFICATE_RENEWAL") {
      navigate("/maintenance");
    } else if (cat === "SYSTEM" && (titleText.includes("USER") || msgText.includes("USER"))) {
      navigate("/users");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "BOOKING":
        return <FaCalendarCheck className="text-primary fs-5" />;
      case "MAINTENANCE":
        return <FaTools className="text-warning fs-5" />;
      case "CALIBRATION":
        return <FaExclamationTriangle className="text-info fs-5" />;
      case "LICENSE_RENEWAL":
        return <FaFileAlt className="text-danger fs-5" />;
      case "CERTIFICATE_RENEWAL":
        return <FaFileAlt className="text-dark fs-5" />;
      case "SYSTEM":
        return <FaUserShield className="text-secondary fs-5" />;
      default:
        return <FaBell className="text-primary fs-5" />;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority ? priority.toUpperCase() : "LOW") {
      case "HIGH":
        return <Badge bg="danger" className="text-uppercase ms-2">High</Badge>;
      case "MEDIUM":
        return <Badge bg="warning" text="dark" className="text-uppercase ms-2">Medium</Badge>;
      default:
        return <Badge bg="secondary" className="text-uppercase ms-2">Low</Badge>;
    }
  };

  const formatType = (category) => {
    if (!category) return "System";
    const mapping = {
      "BOOKING": "Booking",
      "MAINTENANCE": "Maintenance",
      "CALIBRATION": "Calibration",
      "LICENSE_RENEWAL": "License Renewal",
      "CERTIFICATE_RENEWAL": "Certificate Renewal",
      "EQUIPMENT": "Equipment Health",
      "SYSTEM": "System Alert"
    };
    return mapping[category.toUpperCase()] || category;
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2 style={{ cursor: "pointer" }} onClick={() => navigate("/dashboard")}>Lab Resource Utilization Platform</h2>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="navbar-right">
        <button className="notification-btn position-relative" onClick={() => setShowModal(true)}>
          <FaBell />
          {unreadCount > 0 && (
            <Badge bg="danger" className="position-absolute top-0 start-100 translate-middle rounded-pill" style={{ fontSize: "0.65rem" }}>
              {unreadCount}
            </Badge>
          )}
        </button>

        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div>
            <strong>{fullName}</strong>
            <br />
            <small>{role}</small>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Notification Center Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaBell className="text-primary" />
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <Badge bg="danger" pill className="ms-2">
                {unreadCount} New
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div style={{ maxHeight: "500px", overflowY: "auto" }} className="p-3 bg-light">
            {notifications.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <FaBell className="text-muted mb-3 opacity-50" size={40} />
                <h5>No Notifications Available</h5>
                <p className="small">You're all caught up.</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notifications.map((n) => {
                  const isNotificationUnread = !n.read && !n.isRead;
                  return (
                    <ListGroup.Item 
                      key={n.id} 
                      className={`d-flex flex-column gap-2 p-3 mb-3 rounded border shadow-sm ${isNotificationUnread ? "bg-light border-primary border-start border-4" : "bg-white"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <span className="p-2 bg-light rounded shadow-sm d-inline-flex align-items-center justify-content-center">
                            {getCategoryIcon(n.category)}
                          </span>
                          <span className="fw-semibold text-muted small">{formatType(n.category)}</span>
                          {getPriorityBadge(n.priority)}
                        </div>
                        {isNotificationUnread && (
                          <span className="badge bg-primary rounded-circle" style={{ width: "8px", height: "8px", padding: 0 }} title="Unread" />
                        )}
                      </div>

                      <div>
                        <h6 className={`mb-1 ${isNotificationUnread ? "fw-bold" : ""}`}>{n.title}</h6>
                        <p className="text-muted small mb-1">{n.message}</p>
                      </div>

                      <div className="d-flex align-items-center justify-content-between mt-1 pt-2 border-top">
                        <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                          {new Date(n.createdAt).toLocaleString()}
                        </small>
                        {isNotificationUnread && (
                          <Button 
                            variant="outline-success" 
                            size="sm" 
                            className="d-flex align-items-center gap-1 py-1 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(n.id);
                            }}
                          >
                            <FaCheck size={10} /> Mark as Read
                          </Button>
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          {unreadCount > 0 && (
            <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </header>
  );
}

export default Navbar;