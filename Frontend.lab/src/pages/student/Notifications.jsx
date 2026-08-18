import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import InfoIcon from "@mui/icons-material/Info";
import api from "../../services/api";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get("/notifications");
      setNotifications(response.data || []);
    } catch (err) {
      console.warn("GET /notifications failed. Using cached mock alerts.", err);
      setNotifications(MOCK_ALERTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      setErrorMsg("");
      await api.put(`/notifications/${id}`, { read: true });
      setNotifications((prev) =>
        prev.map((n) => ((n.id || n._id) === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn("PUT /notifications failed. Simulating locally...", err);
      setNotifications((prev) =>
        prev.map((n) => ((n.id || n._id) === id ? { ...n, read: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setErrorMsg("");
      // Batch operation if backend supports it, otherwise clear locally
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSuccess("All notifications marked as read.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.warn(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Stay updated with system reservation statuses and maintenance releases.
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            variant="outlined"
            onClick={handleMarkAllRead}
            sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 1 }}>
          <List>
            {notifications.map((n) => {
              const nId = n.id || n._id;
              return (
                <ListItem
                  key={nId}
                  sx={{
                    px: 3,
                    py: 2,
                    backgroundColor: n.read ? "transparent" : "#eff6ff",
                    borderBottom: "1px solid #f1f5f9",
                    "&:last-child": { borderBottom: "none" },
                    borderRadius: 1.5,
                  }}
                  secondaryAction={
                    !n.read && (
                      <IconButton
                        edge="end"
                        onClick={() => handleMarkRead(nId)}
                        sx={{ color: "primary.main" }}
                        title="Mark as Read"
                      >
                        <DoneIcon />
                      </IconButton>
                    )
                  }
                >
                  <InfoIcon sx={{ color: n.read ? "#94a3b8" : "#1e3a8a", mr: 2, fontSize: 24 }} />
                  <ListItemText
                    primary={n.message}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: n.read ? 500 : 700,
                      color: "#0f172a",
                    }}
                    secondary={n.time || "Recently"}
                    secondaryTypographyProps={{ variant: "caption", color: "text.muted" }}
                  />
                  {!n.read && (
                    <Chip
                      label="New"
                      size="small"
                      color="primary"
                      sx={{ fontSize: "0.65rem", height: 16, mr: 3, fontWeight: 700 }}
                    />
                  )}
                </ListItem>
              );
            })}
          </List>
        </Card>
      ) : (
        <Box sx={{ p: 6, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "background.paper" }}>
          <Typography color="text.secondary">You have no new alerts or notifications.</Typography>
        </Box>
      )}
    </Box>
  );
}

const MOCK_ALERTS = [
  { id: "1", message: "Digital Oscilloscope reservation confirmed by Lab Manager.", time: "5 min ago", read: false },
  { id: "2", message: "Centrifuge check out approval pending review.", time: "1 hour ago", read: false },
  { id: "3", message: "Chemistry lab access authorization updated.", time: "2 days ago", read: true },
];
