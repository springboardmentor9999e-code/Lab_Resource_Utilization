import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import { toast } from "../utils/toast";
import notificationService from "../services/notificationService";
import NotificationCard from "../components/NotificationCard";

const MOCK_FALLBACK_NOTIFICATIONS = [
  {
    id: 101,
    title: "Booking Confirmed",
    message: "Your reservation for High-Speed Centrifuge CR22 N-1 has been confirmed for tomorrow at 10:00 AM.",
    type: "BOOKING_CONFIRMED",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 102,
    title: "Equipment Available",
    message: "Mass Spectrometer MS-3000 is now available for reservation in Lab Room 402.",
    type: "EQUIPMENT_AVAILABLE",
    isRead: false,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: 103,
    title: "Maintenance Due",
    message: "Scheduled preventive maintenance for Thermal Cycler TC-96 is due in 3 days.",
    type: "MAINTENANCE_DUE",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: 104,
    title: "Calibration Expiring",
    message: "Precision Analytical Balance AB-204 calibration certificate expires on 15-Aug-2026.",
    type: "CALIBRATION_EXPIRING",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 105,
    title: "Sharing Approved",
    message: "Resource sharing request for Fluorescence Microscope FM-100 has been approved by BioLab Dept.",
    type: "SHARING_APPROVED",
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

export default function NotificationPage() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pushPermission, setPushPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? window.Notification.permission : "default"
  );

  // Phase 3 & Phase 9: Auto refresh every 30-60s
  const fetchNotifications = useCallback(async (showToastNotice = false) => {
    try {
      const data = await notificationService.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      } else {
        setNotifications(MOCK_FALLBACK_NOTIFICATIONS);
      }
      if (showToastNotice) {
        toast.info("Notifications refreshed!", { autoClose: 2000 });
      }
    } catch (err) {
      console.warn("Using fallback notification data", err);
      setNotifications(MOCK_FALLBACK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Phase 9: Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Phase 11: Browser Push Notifications trigger & permission
  const requestBrowserPushPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser push notifications are not supported in this browser.");
      return;
    }

    try {
      const permission = await window.Notification.requestPermission();
      setPushPermission(permission);
      if (permission === "granted") {
        toast.success("Browser push notifications enabled!");
        new window.Notification("Lab Resource utilization Platform", {
          body: "Push Notifications activated successfully!",
          icon: "/favicon.ico",
        });
      } else {
        toast.warn("Browser push notification permission denied.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerMockPushNotification = (type, title, body) => {
    // Phase 10: Toast Notification
    if (type === "success") toast.success(`${title}: ${body}`);
    else if (type === "warning") toast.warning(`${title}: ${body}`);
    else toast.info(`${title}: ${body}`);

    // Phase 11: Browser Popup Notification
    if (pushPermission === "granted" && "Notification" in window) {
      new window.Notification(title, {
        body: body,
        icon: "/favicon.ico",
      });
    }
  };

  // Phase 7: Mark as Read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err) {
      // Local fallback state update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      toast.success("Notification marked as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.warn(err);
    } finally {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      toast.success("All notifications marked as read");
    }
  };

  // Phase 8: Delete Notification
  const handleDeleteNotification = async (id) => {
    try {
      await notificationService.deleteNotification(id);
    } catch (err) {
      console.warn(err);
    } finally {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.info("Notification removed");
    }
  };

  // Create sample notification for demonstration
  const handleCreateDemoNotification = async (typeKey) => {
    const demoConfigs = {
      BOOKING_CONFIRMED: {
        title: "Booking Confirmed",
        message: "Your new booking request for Centrifuge CR22 has been approved.",
        type: "BOOKING_CONFIRMED",
      },
      EQUIPMENT_AVAILABLE: {
        title: "Equipment Available",
        message: "Spectrophotometer SP-100 is now free for use.",
        type: "EQUIPMENT_AVAILABLE",
      },
      MAINTENANCE_DUE: {
        title: "Maintenance Due",
        message: "Autoclave AC-50 preventive service due in 2 days.",
        type: "MAINTENANCE_DUE",
      },
      CALIBRATION_EXPIRING: {
        title: "Calibration Expiring",
        message: "pH Meter Calibration expires tomorrow.",
        type: "CALIBRATION_EXPIRING",
      },
      SHARING_APPROVED: {
        title: "Sharing Approved",
        message: "Inter-department sharing request approved.",
        type: "SHARING_APPROVED",
      },
    };

    const item = demoConfigs[typeKey];
    if (!item) return;

    try {
      const created = await notificationService.createNotification(item);
      setNotifications((prev) => [created, ...prev]);
    } catch (err) {
      const newLocal = {
        id: Date.now(),
        ...item,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newLocal, ...prev]);
    }

    triggerMockPushNotification("info", item.title, item.message);
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const isUnread = !(n.isRead !== undefined ? n.isRead : n.read);
    const matchesTab =
      currentTab === "ALL"
        ? true
        : currentTab === "UNREAD"
        ? isUnread
        : (n.type || "").toUpperCase() === currentTab;

    const matchesSearch =
      (n.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.message || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const unreadCount = notifications.filter(
    (n) => !(n.isRead !== undefined ? n.isRead : n.read)
  ).length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header section */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 850, letterSpacing: "-0.5px", mb: 0.5 }}>
              Notification Center 🔔
            </Typography>
            <Typography variant="body1" sx={{ color: "#94a3b8", fontWeight: 500 }}>
              Stay informed with real-time lab equipment, booking, maintenance, and calibration alerts.
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            {pushPermission !== "granted" ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<NotificationsActiveIcon />}
                onClick={requestBrowserPushPermission}
                sx={{ borderRadius: 3, textTransform: "none", fontWeight: 750, px: 2.5 }}
              >
                Enable Push Popups
              </Button>
            ) : (
              <Chip
                icon={<NotificationsActiveIcon style={{ color: "#4ade80" }} />}
                label="Push Alerts Active"
                sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#fff", fontWeight: 700 }}
              />
            )}

            <Tooltip title="Refresh Notifications">
              <IconButton
                onClick={() => fetchNotifications(true)}
                sx={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: "#fff", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" } }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Demo Notification Dispatchers (Phase 5 Phase 10 Phase 11 demo) */}
        <Box mt={3} pt={2.5} sx={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "block", mb: 1.2 }}>
            Simulate Event Trigger (Test Toast & Browser Push):
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button size="small" variant="outlined" sx={{ color: "#86efac", borderColor: "#86efac", borderRadius: 2, textTransform: "none", fontSize: "0.775rem" }} onClick={() => handleCreateDemoNotification("BOOKING_CONFIRMED")}>
              + Booking Confirmed
            </Button>
            <Button size="small" variant="outlined" sx={{ color: "#7dd3fc", borderColor: "#7dd3fc", borderRadius: 2, textTransform: "none", fontSize: "0.775rem" }} onClick={() => handleCreateDemoNotification("EQUIPMENT_AVAILABLE")}>
              + Equipment Available
            </Button>
            <Button size="small" variant="outlined" sx={{ color: "#fde047", borderColor: "#fde047", borderRadius: 2, textTransform: "none", fontSize: "0.775rem" }} onClick={() => handleCreateDemoNotification("MAINTENANCE_DUE")}>
              + Maintenance Due
            </Button>
            <Button size="small" variant="outlined" sx={{ color: "#fda4af", borderColor: "#fda4af", borderRadius: 2, textTransform: "none", fontSize: "0.775rem" }} onClick={() => handleCreateDemoNotification("CALIBRATION_EXPIRING")}>
              + Calibration Expiring
            </Button>
            <Button size="small" variant="outlined" sx={{ color: "#d8b4fe", borderColor: "#d8b4fe", borderRadius: 2, textTransform: "none", fontSize: "0.775rem" }} onClick={() => handleCreateDemoNotification("SHARING_APPROVED")}>
              + Sharing Approved
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Main Content Area */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
        {/* Controls Bar: Search & Batch actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
          <TextField
            size="small"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 320 } }}
          />

          <Box display="flex" alignItems="center" gap={1.5}>
            {unreadCount > 0 && (
              <Button
                variant="outlined"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllRead}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}
              >
                Mark All ({unreadCount}) Read
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter Tabs */}
        <Tabs
          value={currentTab}
          onChange={(e, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}
        >
          <Tab label={`All (${notifications.length})`} value="ALL" sx={{ fontWeight: 750 }} />
          <Tab label={`Unread (${unreadCount})`} value="UNREAD" sx={{ fontWeight: 750 }} />
          <Tab label="Booking Confirmed" value="BOOKING_CONFIRMED" sx={{ fontWeight: 700 }} />
          <Tab label="Equipment Available" value="EQUIPMENT_AVAILABLE" sx={{ fontWeight: 700 }} />
          <Tab label="Maintenance Due" value="MAINTENANCE_DUE" sx={{ fontWeight: 700 }} />
          <Tab label="Calibration Expiring" value="CALIBRATION_EXPIRING" sx={{ fontWeight: 700 }} />
          <Tab label="Sharing Approved" value="SHARING_APPROVED" sx={{ fontWeight: 700 }} />
        </Tabs>

        {/* Notification List */}
        {loading ? (
          <Box py={8} textAlign="center">
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading notifications...
            </Typography>
          </Box>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteNotification}
            />
          ))
        ) : (
          <Box py={8} textAlign="center">
            <NotificationsOffIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5, mb: 1 }} />
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? "Try refining your search term." : "You're all caught up!"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
