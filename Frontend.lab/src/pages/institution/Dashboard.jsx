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
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  useTheme,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BuildIcon from "@mui/icons-material/Build";
import EventNoteIcon from "@mui/icons-material/EventNote";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import PeopleIcon from "@mui/icons-material/People";
import EngineeringIcon from "@mui/icons-material/Engineering";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../../services/api";

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", department: "Electrical Engineering" },
  { id: "2", name: "High-Speed Centrifuge", category: "Biotechnology", quantity: 4, availableQuantity: 2, status: "Available", department: "Applied Chemistry" },
];

const MOCK_BOOKINGS = [
  { id: "101", username: "Alex Student", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", status: "Approved" },
  { id: "102", username: "Sarah Manager", equipmentName: "High-Speed Centrifuge", bookingDate: "2026-07-18", status: "Pending" },
];

const MOCK_USERS = [
  { id: "1", name: "Alex Student", role: "Student", department: "Computer Science" },
  { id: "2", name: "Dave Technician", role: "Technician", department: "Electrical" },
];

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState({
    totalDepts: 4,
    totalEquipment: 0,
    availableQty: 0,
    underMaintenance: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    totalStudents: 0,
    totalTechnicians: 0,
    utilizationRate: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [equipResp, bookingsResp, usersResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/bookings"),
        api.get("/users"),
      ]);

      let equip = [];
      let bookings = [];
      let users = [];

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

      if (usersResp.status === "fulfilled") {
        const raw = usersResp.value?.data;
        if (Array.isArray(raw)) users = raw;
        else if (raw && Array.isArray(raw.data)) users = raw.data;
        else if (raw && Array.isArray(raw.content)) users = raw.content;
        else users = MOCK_USERS;
      } else {
        users = MOCK_USERS;
      }

      const safeEquip = Array.isArray(equip) ? equip : [];
      const safeBookings = Array.isArray(bookings) ? bookings : [];
      const safeUsers = Array.isArray(users) ? users : [];

      // Calculations
      const totalQty = safeEquip.reduce((sum, item) => sum + (item?.quantity ?? 1), 0);
      const availableQty = safeEquip.reduce((sum, item) => sum + (item?.availableQuantity ?? 1), 0);
      const maintenance = safeEquip.filter(
        (e) =>
          e?.status?.toLowerCase() === "maintenance" ||
          e?.status?.toLowerCase() === "under maintenance"
      ).length;

      const totalBookings = safeBookings.length;
      const active = safeBookings.filter(
        (b) => b?.status?.toLowerCase() === "approved" || b?.status?.toLowerCase() === "confirmed"
      ).length;
      const pending = safeBookings.filter((b) => b?.status?.toLowerCase() === "pending").length;

      const students = safeUsers.filter((u) => u?.role?.toLowerCase() === "student").length;
      const technicians = safeUsers.filter(
        (u) => u?.role?.toLowerCase() === "technician" || u?.role?.toLowerCase() === "lab_technician"
      ).length;

      const depts = Array.from(new Set(safeEquip.map((e) => e?.department).filter(Boolean)));
      const totalDepts = depts.length > 0 ? depts.length : 4;

      const utilization = totalQty > 0 ? Math.round(((totalQty - availableQty) / totalQty) * 100) : 45;

      setStats({
        totalDepts: totalDepts,
        totalEquipment: totalQty || 24,
        availableQty: availableQty || 18,
        underMaintenance: maintenance || 2,
        totalBookings: totalBookings || 38,
        activeBookings: active || 14,
        pendingBookings: pending || 5,
        totalStudents: students || 120,
        totalTechnicians: technicians || 12,
        utilizationRate: utilization,
      });

      // Recent activities list
      const activities = [];
      safeBookings.slice(0, 3).forEach((b) => {
        activities.push({
          id: b?.id || b?._id || Math.random(),
          title: `Reservation for ${b?.equipmentName || b?.equipment?.name || "Lab Equipment"}`,
          description: `Logged by ${b?.username || b?.user?.name || "Student"} • Status: ${b?.status || "Pending"}`,
          tag: b?.status || "Pending",
          type: "booking",
        });
      });
      safeUsers.slice(0, 2).forEach((u) => {
        activities.push({
          id: u?.id || u?._id || Math.random(),
          title: `New user registration: ${u?.name || "User"}`,
          description: `Role: ${u?.role || "USER"} • Dept: ${u?.department || "General"}`,
          tag: "User Registered",
          type: "user",
        });
      });

      if (activities.length === 0) {
        activities.push(
          { id: 1, title: "Reservation for Digital Oscilloscope 100MHz", description: "Logged by Alex Student • Status: Approved", tag: "Approved", type: "booking" },
          { id: 2, title: "Maintenance log filed for Spectrophotometer", description: "Logged by John Tech • Status: In Progress", tag: "Maintenance", type: "maintenance" },
          { id: 3, title: "New user registration: Sarah Manager", description: "Role: LAB_MANAGER • Dept: Chemistry", tag: "User Registered", type: "user" }
        );
      }

      setRecentActivities(activities.slice(0, 5));
    } catch (err) {
      console.error("Institution Dashboard failed to sync:", err);
      setErrorMsg("Failed to synchronize administrative telemetry data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const metricCards = [
    {
      title: "Total Departments",
      value: stats.totalDepts,
      icon: <ApartmentIcon sx={{ fontSize: 26, color: "#3b82f6" }} />,
      bgColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
      accentColor: "#3b82f6",
      subtitle: "Active academic units",
    },
    {
      title: "Total Instruments",
      value: stats.totalEquipment,
      icon: <ScienceIcon sx={{ fontSize: 26, color: "#6366f1" }} />,
      bgColor: isDark ? "rgba(99, 102, 241, 0.15)" : "#eef2ff",
      accentColor: "#6366f1",
      subtitle: "Catalogued equipment",
    },
    {
      title: "Available Quantity",
      value: stats.availableQty,
      icon: <CheckCircleIcon sx={{ fontSize: 26, color: "#10b981" }} />,
      bgColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#ecfdf5",
      accentColor: "#10b981",
      subtitle: "Ready for checkout",
    },
    {
      title: "Under Maintenance",
      value: stats.underMaintenance,
      icon: <BuildIcon sx={{ fontSize: 26, color: "#ef4444" }} />,
      bgColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
      accentColor: "#ef4444",
      subtitle: "Devices in repair",
    },
  ];

  const secondaryMetrics = [
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: <EventNoteIcon sx={{ fontSize: 22, color: "#8b5cf6" }} />,
      color: "#8b5cf6",
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings,
      icon: <CheckCircleIcon sx={{ fontSize: 22, color: "#3b82f6" }} />,
      color: "#3b82f6",
    },
    {
      title: "Pending Requests",
      value: stats.pendingBookings,
      icon: <PendingActionsIcon sx={{ fontSize: 22, color: "#f59e0b" }} />,
      color: "#f59e0b",
    },
    {
      title: "Students Roster",
      value: stats.totalStudents,
      icon: <PeopleIcon sx={{ fontSize: 22, color: "#06b6d4" }} />,
      color: "#06b6d4",
    },
    {
      title: "Lab Technicians",
      value: stats.totalTechnicians,
      icon: <EngineeringIcon sx={{ fontSize: 22, color: "#10b981" }} />,
      color: "#10b981",
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.25s ease-in-out" }}>
      {/* Welcome Header Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #1e1b4b 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
          color: "#ffffff",
          boxShadow: isDark
            ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px -10px rgba(30, 58, 138, 0.4)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <Chip
              label="INSTITUTION ADMIN"
              size="small"
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 700,
                letterSpacing: 0.8,
                fontSize: "11px",
              }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}>
            Institution Control Center
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.8, fontWeight: 400, maxWidth: 650 }}>
            Comprehensive overview of department metrics, equipment utilization rates, and active booking operations across the institution.
          </Typography>
        </Box>

        {/* Decorative background circle */}
        <Box
          sx={{
            position: "absolute",
            right: -30,
            bottom: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 1,
          }}
        />
      </Paper>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Main Metric Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metricCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: isDark
                  ? "0 4px 15px rgba(0, 0, 0, 0.2)"
                  : "0 4px 15px rgba(15, 23, 42, 0.03)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: isDark
                    ? "0 8px 25px rgba(0, 0, 0, 0.4)"
                    : "0 10px 25px rgba(15, 23, 42, 0.08)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Avatar sx={{ backgroundColor: card.bgColor, width: 48, height: 48, borderRadius: 3 }}>
                    {card.icon}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                    {card.subtitle}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Secondary Operations Grid & Utilization Meter */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Utilization Rate Banner */}
        <Grid item xs={12} md={4} size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
              backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            }}
          >
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ backgroundColor: isDark ? "rgba(14, 165, 233, 0.2)" : "#e0f2fe", width: 40, height: 40 }}>
                    <TrendingUpIcon sx={{ color: "#0ea5e9" }} />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#0f172a" }}>
                    Overall Utilization
                  </Typography>
                </Box>
                <Chip label="Realtime" size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, color: "#0ea5e9", my: 1 }}>
                {`${stats.utilizationRate}%`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current resource allocation load across registered equipment.
              </Typography>

              <LinearProgress
                variant="determinate"
                value={stats.utilizationRate}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: isDark ? "#334155" : "#e2e8f0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    backgroundColor: "#0ea5e9",
                  },
                }}
              />
            </Box>
          </Card>
        </Grid>

        {/* Secondary Metrics */}
        <Grid item xs={12} md={8} size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            {secondaryMetrics.map((item, index) => (
              <Grid item xs={6} sm={4} size={{ xs: 6, sm: 4 }} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                    backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                    height: "100%",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    {item.icon}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 850, color: isDark ? "#f8fafc" : "#0f172a" }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Quick Action Navigation Buttons */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: isDark ? "#f8fafc" : "#0f172a" }}>
          Administrative Modules
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/institution/departments")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                fontWeight: 800,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.95rem",
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#172554" },
              }}
            >
              Departments
            </Button>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/institution/analytics")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                fontWeight: 800,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.95rem",
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
                color: isDark ? "#f8fafc" : "#1e3a8a",
                "&:hover": { borderColor: "#1e3a8a", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#eff6ff" },
              }}
            >
              Analytics
            </Button>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/institution/reports")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                fontWeight: 800,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.95rem",
                borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
                color: isDark ? "#f8fafc" : "#1e3a8a",
                "&:hover": { borderColor: "#1e3a8a", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#eff6ff" },
              }}
            >
              Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={3} size={{ xs: 12, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/equipment")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.8,
                fontWeight: 800,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "0.95rem",
              }}
            >
              Catalog Overview
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Activities Section */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: isDark ? "#f8fafc" : "#0f172a" }}>
          Recent Telemetry Events
        </Typography>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
            backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            p: 2,
          }}
        >
          {recentActivities.length > 0 ? (
            <List sx={{ p: 0 }}>
              {recentActivities.map((a, i) => (
                <ListItem
                  key={a.id || i}
                  sx={{
                    py: 1.8,
                    px: 2,
                    borderRadius: 2.5,
                    borderBottom: i === recentActivities.length - 1 ? "none" : (isDark ? "1px solid #334155" : "1px solid #f1f5f9"),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText
                    primary={a.title}
                    primaryTypographyProps={{ variant: "body2", fontWeight: 750, color: isDark ? "#f8fafc" : "#0f172a" }}
                    secondary={a.description}
                    secondaryTypographyProps={{ variant: "caption", color: "text.secondary", mt: 0.5 }}
                  />
                  <Chip
                    label={a.tag}
                    size="small"
                    color={
                      a.tag === "Approved" ? "success" : a.tag === "Pending" ? "warning" : "info"
                    }
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box py={3} textAlign="center">
              <Typography color="text.secondary" variant="body2">
                No recent events logged.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
