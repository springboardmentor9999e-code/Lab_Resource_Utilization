import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookIcon from "@mui/icons-material/Book";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import api from "../../services/api";

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", availableQuantity: 6 },
  { id: "2", name: "UV-Vis Spectrophotometer", availableQuantity: 0 },
  { id: "3", name: "Refrigerated Centrifuge", availableQuantity: 5 },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Approved" },
  { id: "102", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "Pending" },
];

const MOCK_ALERTS = [
  { id: "1", message: "Digital Oscilloscope reservation confirmed.", time: "5 min ago" },
  { id: "2", message: "Centrifuge check out approval pending review.", time: "1 hour ago" },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    activeBookings: 0,
    pendingRequests: 0,
    completedBookings: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [latestAlerts, setLatestAlerts] = useState([]);

  const username = localStorage.getItem("username") || "Student";

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [equipResp, bookingsResp, notifyResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/bookings"),
        api.get("/notifications"),
      ]);

      let equip = [];
      let bookings = [];
      let alerts = [];

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equip = raw;
        else if (raw && Array.isArray(raw.data)) equip = raw.data;
        else if (raw && Array.isArray(raw.content)) equip = raw.content;
        else equip = MOCK_EQUIPMENT;
      } else {
        equip = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        let rawBookings = [];
        if (Array.isArray(raw)) rawBookings = raw;
        else if (raw && Array.isArray(raw.data)) rawBookings = raw.data;
        else if (raw && Array.isArray(raw.content)) rawBookings = raw.content;
        else rawBookings = [];

        const currentUserEmail = (localStorage.getItem("email") || "").toLowerCase();
        const currentUsername = (localStorage.getItem("username") || "Student").toLowerCase();
        bookings = rawBookings.filter((b) => {
          const userEmail = (b?.user?.email || "").toLowerCase();
          const uName = (b?.username || b?.user?.name || "").toLowerCase();
          return (
            (userEmail && userEmail === currentUserEmail) ||
            (uName && uName === currentUsername)
          );
        });
      } else {
        const currentUsername = (localStorage.getItem("username") || "Student").toLowerCase();
        let localBookings = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("local_bookings") || "[]");
          if (Array.isArray(parsed)) localBookings = parsed;
        } catch (e) {
          localBookings = [];
        }
        const combinedMock = [...(Array.isArray(MOCK_BOOKINGS) ? MOCK_BOOKINGS : []), ...localBookings];
        bookings = combinedMock.filter((b) => {
          const uName = (b?.username || b?.user?.name || "").toLowerCase();
          return uName && uName === currentUsername;
        });
      }

      if (notifyResp.status === "fulfilled") {
        const raw = notifyResp.value?.data;
        if (Array.isArray(raw)) alerts = raw;
        else if (raw && Array.isArray(raw.data)) alerts = raw.data;
        else if (raw && Array.isArray(raw.content)) alerts = raw.content;
        else alerts = MOCK_ALERTS;
      } else {
        alerts = MOCK_ALERTS;
      }

      const safeEquip = Array.isArray(equip) ? equip : [];
      const safeBookings = Array.isArray(bookings) ? bookings : [];
      const safeAlerts = Array.isArray(alerts) ? alerts : [];

      // Filter and compute stats safely
      const total = safeEquip.length;
      const available = safeEquip.filter((e) => (e?.availableQuantity ?? 0) > 0).length;
      
      const active = safeBookings.filter(
        (b) => b?.status?.toLowerCase() === "approved" || b?.status?.toLowerCase() === "confirmed"
      ).length;

      const pending = safeBookings.filter((b) => b?.status?.toLowerCase() === "pending").length;
      const completed = safeBookings.filter((b) => b?.status?.toLowerCase() === "completed").length;

      setStats({
        totalEquipment: total,
        availableEquipment: available,
        activeBookings: active,
        pendingRequests: pending,
        completedBookings: completed,
      });

      setRecentBookings(safeBookings.slice(0, 5));
      setLatestAlerts(safeAlerts.slice(0, 3));
    } catch (err) {
      console.error("Dashboard failed to sync:", err);
      setErrorMsg("Failed to synchronize live operational analytics from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      {/* Welcome Card */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
          color: "white",
          boxShadow: "0 4px 20px rgba(30, 58, 138, 0.2)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Welcome, {username}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 700 }}>
              Role:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Student
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Total Assets
                </Typography>
                <Typography variant="h4" fontWeight={850} color="text.primary" mt={0.5}>
                  {stats.totalEquipment}
                </Typography>
              </Box>
              <ScienceIcon color="primary" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Available Qty
                </Typography>
                <Typography variant="h4" fontWeight={850} color="success.main" mt={0.5}>
                  {stats.availableEquipment}
                </Typography>
              </Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Active Bookings
                </Typography>
                <Typography variant="h4" fontWeight={850} color="info.main" mt={0.5}>
                  {stats.activeBookings}
                </Typography>
              </Box>
              <BookIcon color="info" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Pending Requests
                </Typography>
                <Typography variant="h4" fontWeight={850} color="warning.main" mt={0.5}>
                  {stats.pendingRequests}
                </Typography>
              </Box>
              <HourglassEmptyIcon color="warning" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  Completed
                </Typography>
                <Typography variant="h4" fontWeight={850} color="secondary.main" mt={0.5}>
                  {stats.completedBookings}
                </Typography>
              </Box>
              <DoneAllIcon color="secondary" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate("/equipment")}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              Browse Equipment
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => navigate("/equipment")}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              Book Equipment
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/student/bookings")}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              My Bookings
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Grid: Bookings & Notifications */}
      <Grid container spacing={4}>
        {/* Bookings log */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Bookings Log
          </Typography>

          {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 650 }}>Equipment Name</TableCell>
                    <TableCell sx={{ fontWeight: 650 }}>Booking Date</TableCell>
                    <TableCell sx={{ fontWeight: 650 }}>Return Date</TableCell>
                    <TableCell sx={{ fontWeight: 650 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.map((b) => (
                    <TableRow key={b?.id || b?._id || Math.random()} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{b?.equipment?.name || b?.equipmentName || "Resource"}</TableCell>
                      <TableCell>{b?.bookingDate || "-"}</TableCell>
                      <TableCell>{b?.returnDate || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={b?.status || "Pending"}
                          color={getStatusChipColor(b?.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3, bgcolor: "background.paper" }}>
              <Typography color="text.secondary" variant="body2">
                No bookings logged in the system.
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Latest Alerts
          </Typography>
          
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 2 }}>
            {Array.isArray(latestAlerts) && latestAlerts.length > 0 ? (
              <List sx={{ p: 0 }}>
                {latestAlerts.map((a) => (
                  <ListItem
                    key={a?.id || Math.random()}
                    sx={{
                      px: 1,
                      py: 1.5,
                      borderBottom: "1px solid #f1f5f9",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <ListItemText
                      primary={a?.message || "Notification"}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                      secondary={a?.time || "Recently"}
                      secondaryTypographyProps={{ variant: "caption", color: "text.muted" }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">
                  No notifications logged.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
