import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BookIcon from "@mui/icons-material/Book";
import WarningIcon from "@mui/icons-material/Warning";
import api from "../../services/api";

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 1, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Maintenance" },
];

const MOCK_BOOKINGS = [
  { id: "101", username: "Alex Student", equipmentName: "Digital Oscilloscope 100MHz", status: "Pending" },
  { id: "102", username: "Maria Student", equipmentName: "Refrigerated Centrifuge", status: "Approved" },
];

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    underMaintenance: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    returnedToday: 0,
    lowStockCount: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/bookings"),
      ]);

      let equip = [];
      let bookings = [];

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
        if (Array.isArray(raw)) bookings = raw;
        else if (raw && Array.isArray(raw.data)) bookings = raw.data;
        else if (raw && Array.isArray(raw.content)) bookings = raw.content;
        else bookings = MOCK_BOOKINGS;
      } else {
        bookings = MOCK_BOOKINGS;
      }

      const safeEquip = Array.isArray(equip) ? equip : [];
      const safeBookings = Array.isArray(bookings) ? bookings : [];

      // Calculations
      const total = safeEquip.length;
      const available = safeEquip.filter((e) => e?.status?.toLowerCase() === "available").length;
      
      const maintenance = safeEquip.filter(
        (e) =>
          e?.status?.toLowerCase() === "maintenance" ||
          e?.status?.toLowerCase() === "under maintenance"
      ).length;

      const pending = safeBookings.filter((b) => b?.status?.toLowerCase() === "pending").length;
      const approved = safeBookings.filter(
        (b) => b?.status?.toLowerCase() === "approved" || b?.status?.toLowerCase() === "confirmed"
      ).length;

      const returned = safeBookings.filter((b) => b?.status?.toLowerCase() === "returned").length;

      const lowStock = safeEquip.filter((e) => (e?.availableQuantity ?? 0) <= 2);

      setStats({
        totalEquipment: total,
        availableEquipment: available,
        underMaintenance: maintenance,
        pendingBookings: pending,
        approvedBookings: approved,
        returnedToday: returned,
        lowStockCount: lowStock.length,
      });

      setLowStockList(lowStock);

      // Activities log
      const activities = [];
      safeBookings.slice(0, 3).forEach((b) => {
        activities.push({
          id: b?.id || b?._id || Math.random(),
          title: `Booking request for ${b?.equipmentName || b?.equipment?.name || "Equipment"}`,
          description: `Requested by ${b?.username || b?.user?.name || "Student"} - Status: ${b?.status || "Pending"}`,
          time: "Recently",
        });
      });
      safeEquip.slice(0, 2).forEach((e) => {
        if (e?.status?.toLowerCase() === "maintenance" || e?.status?.toLowerCase() === "under maintenance") {
          activities.push({
            id: e?.id || e?._id || Math.random(),
            title: `${e?.name || "Equipment"} flagged for Maintenance`,
            description: "Technician diagnostic ticket initialized.",
            time: "Recently",
          });
        }
      });

      setRecentActivities(activities.slice(0, 5));
    } catch (err) {
      console.error("Technician dashboard failed to load:", err);
      setErrorMsg("Failed to synchronize technician summary metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      {/* Welcome header */}
      <Card
        sx={{
          mb: 4,
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)",
          color: "white",
          boxShadow: "0 4px 20px rgba(30, 41, 59, 0.25)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Welcome Technician
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 500 }}>
            Role: Lab Technician
          </Typography>
        </CardContent>
      </Card>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards Row */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Asset & Operations Status
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={750}>
                  Total Equipment
                </Typography>
                <Typography variant="h4" fontWeight={850} color="text.primary" mt={0.5}>
                  {stats.totalEquipment}
                </Typography>
              </Box>
              <ScienceIcon color="primary" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={750}>
                  Available Equipment
                </Typography>
                <Typography variant="h4" fontWeight={850} color="success.main" mt={0.5}>
                  {stats.availableEquipment}
                </Typography>
              </Box>
              <CheckCircleIcon color="success" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={750}>
                  Under Maintenance
                </Typography>
                <Typography variant="h4" fontWeight={850} color="error.main" mt={0.5}>
                  {stats.underMaintenance}
                </Typography>
              </Box>
              <BuildIcon color="error" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={750}>
                  Pending Bookings
                </Typography>
                <Typography variant="h4" fontWeight={850} color="warning.main" mt={0.5}>
                  {stats.pendingBookings}
                </Typography>
              </Box>
              <HourglassEmptyIcon color="warning" sx={{ fontSize: 36, opacity: 0.7 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Action Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Quick Action Cards
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={2.4}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/technician/equipment/add")}
              sx={{ py: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Add Equipment
            </Button>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/technician/equipment")}
              sx={{ py: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Manage Equipment
            </Button>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/technician/bookings/approve")}
              sx={{ py: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Approve Bookings
            </Button>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/technician/maintenance")}
              sx={{ py: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Maintenance
            </Button>
          </Grid>
          <Grid item xs={12} sm={2.4}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/technician/reports")}
              sx={{ py: 2, fontWeight: 700, borderRadius: 2 }}
            >
              Reports
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Main Grid: Recent Activities & Low Stock notifications */}
      <Grid container spacing={4}>
        {/* Recent Activities */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Activities
          </Typography>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 2 }}>
            {Array.isArray(recentActivities) && recentActivities.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentActivities.map((a) => (
                  <ListItem key={a?.id || Math.random()} sx={{ borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" }, py: 1.5 }}>
                    <ListItemText
                      primary={a?.title || "Activity"}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                      secondary={a?.description || ""}
                      secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">No recent actions logged.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Low Stock notifications */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "error.main", display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon />
            Low Stock Alerts ({stats.lowStockCount})
          </Typography>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 2 }}>
            {Array.isArray(lowStockList) && lowStockList.length > 0 ? (
              <List sx={{ p: 0 }}>
                {lowStockList.map((item) => (
                  <ListItem key={item?.id || item?._id || Math.random()} sx={{ py: 1, borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" } }}>
                    <ListItemText
                      primary={item?.name || "Equipment"}
                      primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                      secondary={`Available Quantity: ${item?.availableQuantity ?? 0}`}
                      secondaryTypographyProps={{ variant: "caption", color: "error.main", fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 2, textAlign: "center" }}>
                <Typography color="text.secondary" variant="body2">All equipment is fully stocked.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
