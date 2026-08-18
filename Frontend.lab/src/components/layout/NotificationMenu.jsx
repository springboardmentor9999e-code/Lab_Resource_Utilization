import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import notificationService from "../../services/notificationService";
import NotificationBell from "../NotificationBell";
import NotificationDropdown from "../NotificationDropdown";

export default function NotificationMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      const list = Array.isArray(data) && data.length > 0 ? data : MOCK_FALLBACK_ALERTS;
      setNotifications(list);
      const count = list.filter((n) => !(n.isRead !== undefined ? n.isRead : n.read)).length;
      setUnreadCount(count);
    } catch (err) {
      console.warn("GET /notifications failed. Using fallback notifications.", err);
      setNotifications(MOCK_FALLBACK_ALERTS);
      const count = MOCK_FALLBACK_ALERTS.filter((n) => !n.isRead).length;
      setUnreadCount(count);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Polling every 30 seconds for auto refresh
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.warn(err);
    } finally {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
      setUnreadCount(0);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.warn(err);
    } finally {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <Box>
      <NotificationBell unreadCount={unreadCount} onClick={handleClick} />

      <NotificationDropdown
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllRead}
        onMarkSingleRead={handleMarkSingleRead}
      />
    </Box>
  );
}

const MOCK_FALLBACK_ALERTS = [
  {
    id: 1,
    title: "Booking Confirmed",
    message: "High-Speed Centrifuge booking has been approved.",
    type: "BOOKING_CONFIRMED",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Maintenance Due",
    message: "Thermal Cycler scheduled maintenance due in 2 days.",
    type: "MAINTENANCE_DUE",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    title: "Calibration Expiring",
    message: "Analytical Balance calibration certificate expiring soon.",
    type: "CALIBRATION_EXPIRING",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
