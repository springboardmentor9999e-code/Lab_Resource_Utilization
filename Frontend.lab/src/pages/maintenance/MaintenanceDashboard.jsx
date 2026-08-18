import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  useTheme,
  Stack,
  Fade
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Material Icons
import BuildIcon from "@mui/icons-material/Build";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import EngineeringIcon from "@mui/icons-material/Engineering";

import { getAllMaintenance } from "../../services/maintenanceService";

// Top Right Wrench & Clipboard Vector Illustration
const MaintenanceIllustration = () => (
  <svg width="210" height="105" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="160" cy="20" r="16" fill="#e0e7ff" opacity="0.7"/>
    <circle cx="35" cy="75" r="12" fill="#dbeafe" opacity="0.6"/>
    <circle cx="100" cy="15" r="6" fill="#bfdbfe" opacity="0.7"/>
    
    {/* Large Blue Gear */}
    <g transform="translate(125, 12) scale(0.65)">
      <path d="M25 0L30 8C33 9 36 11 38 13L47 10L52 18L44 24C45 27 45 30 44 33L52 39L47 47L38 44C36 46 33 48 30 49L25 57L17 57L12 49C9 48 6 46 4 44L-5 47L-10 39L-2 33C-3 30 -3 27 -2 24L-10 18L-5 10L4 13C6 11 9 9 12 8L17 0H25Z" fill="#93c5fd"/>
      <circle cx="21" cy="28.5" r="10" fill="#ffffff"/>
    </g>

    {/* Small Blue Gear */}
    <g transform="translate(90, 40) scale(0.42)">
      <path d="M25 0L30 8C33 9 36 11 38 13L47 10L52 18L44 24C45 27 45 30 44 33L52 39L47 47L38 44C36 46 33 48 30 49L25 57L17 57L12 49C9 48 6 46 4 44L-5 47L-10 39L-2 33C-3 30 -3 27 -2 24L-10 18L-5 10L4 13C6 11 9 9 12 8L17 0H25Z" fill="#3b82f6"/>
      <circle cx="21" cy="28.5" r="10" fill="#ffffff"/>
    </g>

    {/* Wrench */}
    <g transform="translate(60, 48) rotate(-35) scale(0.75)">
      <path d="M10 0 C5 0 0 5 0 10 C0 14 3 17 6 19 L-25 50 C-27 52 -27 55 -25 57 L-20 62 C-18 64 -15 64 -13 62 L18 31 C20 34 23 37 27 37 C32 37 37 32 37 27 C37 23 34 20 31 18 L26 23 L18 23 L14 15 L19 10 C17 3 14 0 10 0 Z" fill="#2563eb"/>
    </g>

    {/* Clipboard Checklist */}
    <g transform="translate(142, 22) scale(0.7)">
      <rect x="0" y="0" width="46" height="62" rx="7" fill="#ffffff" stroke="#2563eb" strokeWidth="3"/>
      <rect x="14" y="-5" width="18" height="9" rx="2" fill="#2563eb"/>
      <path d="M11 20 L17 25 L27 15" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="11" y1="35" x2="36" y2="35" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
      <line x1="11" y1="46" x2="31" y2="46" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round"/>
    </g>
  </svg>
);

const MOCK_MAINTENANCE_FALLBACK = [
  { id: 101, equipmentName: "UV-Vis Spectrophotometer", issueTitle: "Optical lamp alignment required", technician: "Sarah Connor", status: "IN_PROGRESS", priority: "HIGH", requestDate: "2026-08-14", cost: 1250 },
  { id: 102, equipmentName: "Digital Oscilloscope 100MHz", issueTitle: "Channel 2 probe calibration", technician: "John Doe", status: "COMPLETED", priority: "MEDIUM", requestDate: "2026-08-10", cost: 450 },
  { id: 103, equipmentName: "Refrigerated Centrifuge", issueTitle: "Rotor lock sensor fault", technician: "Alex Tech", status: "PENDING", priority: "HIGH", requestDate: "2026-08-16", cost: 2100 },
  { id: 104, equipmentName: "AC Power Source Variac", issueTitle: "Fuse replacement & safety check", technician: "John Doe", status: "COMPLETED", priority: "LOW", requestDate: "2026-08-05", cost: 150 },
];

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [maintenanceList, setMaintenanceList] = useState([]);
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAllMaintenance();
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      }
      
      if (list.length > 0) {
        setMaintenanceList(list);
      } else {
        setMaintenanceList(MOCK_MAINTENANCE_FALLBACK);
      }
    } catch (error) {
      console.error("Error loading maintenance dashboard:", error);
      setMaintenanceList(MOCK_MAINTENANCE_FALLBACK);
    }
  };

  const total = maintenanceList.length;
  const pending = maintenanceList.filter(
    (m) => (m.status || "").toUpperCase() === "PENDING"
  ).length;
  const progress = maintenanceList.filter(
    (m) =>
      (m.status || "").toUpperCase() === "IN_PROGRESS" ||
      (m.status || "").toUpperCase() === "IN PROGRESS"
  ).length;
  const completed = maintenanceList.filter(
    (m) => (m.status || "").toUpperCase() === "COMPLETED"
  ).length;
  const cancelled = maintenanceList.filter(
    (m) => (m.status || "").toUpperCase() === "CANCELLED"
  ).length;

  const totalCost = maintenanceList.reduce(
    (sum, item) => sum + (Number(item.cost) || 0),
    0
  );

  const getStatusChip = (statusStr) => {
    const s = (statusStr || "").toUpperCase();
    if (s === "COMPLETED")
      return <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />;
    if (s === "PENDING")
      return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />;
    if (s === "IN_PROGRESS" || s === "IN PROGRESS")
      return <Chip label="In Progress" color="info" size="small" sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />;
    if (s === "CANCELLED")
      return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />;
    return <Chip label={statusStr || "N/A"} size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
  };

  const getPriorityChip = (priorityStr) => {
    const p = (priorityStr || "").toUpperCase();
    if (p === "HIGH")
      return <Chip label="High" color="error" variant="outlined" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
    if (p === "MEDIUM")
      return <Chip label="Medium" color="warning" variant="outlined" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
    if (p === "LOW")
      return <Chip label="Low" color="success" variant="outlined" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
    return <Chip label={priorityStr || "Normal"} size="small" variant="outlined" sx={{ fontWeight: 700, borderRadius: 1.5 }} />;
  };

  // Filter maintenance list for table
  const filteredList = maintenanceList.filter((item) => {
    const eqName = item.equipment?.equipmentName || item.equipmentName || item.equipmentId || "";
    const issue = item.issueTitle || item.description || "";
    const tech = item.technician || item.assignedTechnician || "";
    const q = searchQuery.toLowerCase();

    const matchesSearch = eqName.toLowerCase().includes(q) || issue.toLowerCase().includes(q) || tech.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || (item.status || "").toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <Fade in timeout={350}>
      <Box sx={{ p: { xs: 2, sm: 3.5 }, maxWidth: 1600, margin: "0 auto", bgcolor: isDark ? "transparent" : "#f8fafc", minHeight: "90vh" }}>
        
        {/* Top Header Card Banner with Actions & Vector Graphic */}
        <Card
          elevation={0}
          sx={{
            mb: 3.5,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            background: isDark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
          }}
        >
          <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={3}
          >
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: "#2563eb",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  <EngineeringIcon />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 850,
                    color: isDark ? "#f8fafc" : "#0f172a",
                    letterSpacing: "-0.5px"
                  }}
                >
                  Maintenance Dashboard
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, maxW: 600 }}>
                Comprehensive control center for equipment diagnostics, technician assignments, repair schedules, and cost metrics.
              </Typography>

              {/* Action Buttons Toolbar */}
              <Stack direction="row" spacing={1.5} mt={2.5} flexWrap="wrap" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/maintenance/add")}
                  sx={{
                    fontWeight: 750,
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1,
                    textTransform: "none",
                    bgcolor: "#2563eb",
                    "&:hover": { bgcolor: "#1d4ed8" },
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  Add Maintenance
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ListAltIcon />}
                  onClick={() => navigate("/maintenance")}
                  sx={{
                    fontWeight: 750,
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1,
                    textTransform: "none",
                    borderColor: isDark ? "rgba(255,255,255,0.2)" : "#cbd5e1",
                    color: isDark ? "#f8fafc" : "#334155",
                    "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9" }
                  }}
                >
                  View All Records
                </Button>
                <Button
                  variant="text"
                  startIcon={<HistoryIcon />}
                  onClick={() => navigate("/maintenance/history")}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2.5,
                    px: 2,
                    py: 1,
                    textTransform: "none",
                    color: "#64748b"
                  }}
                >
                  Maintenance History
                </Button>
              </Stack>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "block" } }}>
              <MaintenanceIllustration />
            </Box>
          </Box>
        </Card>

        {/* 5 KPI Metric Cards Row */}
        <Grid container spacing={2.5} mb={3.5}>
          {/* Total Maintenance */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "#2563eb",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
                  }}
                >
                  <BuildIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Total Maintenance
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.1 }}>
                    {total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    All Time Records
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Pending */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "#f59e0b",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)"
                  }}
                >
                  <HourglassEmptyIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.1 }}>
                    {pending}
                  </Typography>
                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                    Awaiting Action
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* In Progress */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "#0284c7",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)"
                  }}
                >
                  <AutorenewIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    In Progress
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.1 }}>
                    {progress}
                  </Typography>
                  <Typography variant="caption" color="info.main" fontWeight={600}>
                    Under Diagnostics
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Completed */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "#10b981",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                  }}
                >
                  <CheckCircleIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Completed
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.1 }}>
                    {completed}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    Fully Resolved
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Cancelled */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.2,
                borderRadius: 3.5,
                border: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                transition: "transform 0.2s ease, boxShadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.06)" }
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    bgcolor: "#ef4444",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                  }}
                >
                  <CancelIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Cancelled
                  </Typography>
                  <Typography variant="h4" fontWeight={850} color={isDark ? "#f8fafc" : "#0f172a"} sx={{ my: 0.1 }}>
                    {cancelled}
                  </Typography>
                  <Typography variant="caption" color="error.main" fontWeight={600}>
                    Deferred Tasks
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Total Maintenance Cost Banner Card */}
        <Card
          elevation={0}
          sx={{
            p: 2.8,
            mb: 3.5,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(124, 58, 237, 0.25)" : "#e0e7ff",
            background: isDark
              ? "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)"
              : "linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%)",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.05)"
          }}
        >
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  bgcolor: "#7c3aed",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)"
                }}
              >
                <CurrencyRupeeIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={750} sx={{ textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Total Maintenance Cost
                </Typography>
                <Typography variant="h3" fontWeight={850} color={isDark ? "#ffffff" : "#0f172a"}>
                  ₹{totalCost.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                <MenuItem value="This Month">This Month</MenuItem>
                <MenuItem value="This Quarter">This Quarter</MenuItem>
                <MenuItem value="This Year">This Year</MenuItem>
                <MenuItem value="All Time">All Time</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>

        {/* Recent Maintenance Table Card with Search & Filters */}
        <Card
          elevation={0}
          sx={{
            mb: 3.5,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            overflow: "hidden"
          }}
        >
          <Box p={3} pb={2} display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2}>
            <Box>
              <Typography variant="h6" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"}>
                Recent Maintenance Records
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredList.length} of {maintenanceList.length} maintenance activities
              </Typography>
            </Box>

            {/* Table Search & Status Filter Controls */}
            <Stack direction="row" spacing={1.5} width={{ xs: "100%", sm: "auto" }}>
              <TextField
                size="small"
                placeholder="Search equipment, issue or technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                  borderRadius: 2,
                  minWidth: 240,
                  "& .MuiOutlinedInput-root": { borderRadius: 2 }
                }}
              />
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
                    fontWeight: 700,
                    fontSize: "0.85rem"
                  }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: "transparent" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Equipment Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Issue Title / Details</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Assigned Technician</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "text.primary", py: 1.8 }} align="right">Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredList.length > 0 ? (
                  filteredList.slice(0, 6).map((item, index) => (
                    <TableRow key={item.id || index} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ fontWeight: 800, color: "#2563eb" }}>#{item.id}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        {item.equipment?.equipmentName || item.equipmentName || item.equipmentId || "Lab Equipment"}
                      </TableCell>
                      <TableCell sx={{ color: "text.secondary", maxWidth: 220 }}>
                        {item.issueTitle || item.description || "Routine Maintenance & Servicing"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {item.technician || item.assignedTechnician || "Unassigned"}
                      </TableCell>
                      <TableCell>{getStatusChip(item.status)}</TableCell>
                      <TableCell>{getPriorityChip(item.priority)}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {item.requestDate || item.date || item.createdAt || "2026-08-15"}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        ₹{Number(item.cost || 0).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 1
                          }}
                        >
                          <Inventory2OutlinedIcon sx={{ fontSize: 36, color: "#94a3b8" }} />
                        </Box>
                        <Typography variant="h6" fontWeight={800} color={isDark ? "#cbd5e1" : "#334155"}>
                          No Maintenance Records Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" maxW={400}>
                          No maintenance entries match your search criteria. Create a new maintenance request to get started.
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => navigate("/maintenance/add")}
                          sx={{ mt: 1, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
                        >
                          Create New Maintenance
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Bottom 4 Feature Quick Link Cards */}
        <Grid container spacing={2.5} mb={4}>
          {/* 1. View Maintenance List */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: 3.5,
                bgcolor: isDark ? "rgba(124, 58, 237, 0.08)" : "#f5f3ff",
                border: "1px solid",
                borderColor: isDark ? "rgba(124, 58, 237, 0.2)" : "#ede9fe",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-3px)" }
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "#7c3aed",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    boxShadow: "0 4px 12px rgba(124, 58, 237, 0.25)"
                  }}
                >
                  <ListAltIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 0.8, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  View Maintenance List
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Browse, filter, and inspect full records of all ongoing and past equipment maintenance requests.
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/maintenance")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: isDark ? "rgba(124, 58, 237, 0.15)" : "#ede9fe",
                  color: "#7c3aed",
                  fontWeight: 750,
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { bgcolor: isDark ? "rgba(124, 58, 237, 0.25)" : "#ddd6fe" }
                }}
              >
                View List
              </Button>
            </Card>
          </Grid>

          {/* 2. Add Maintenance */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: 3.5,
                bgcolor: isDark ? "rgba(22, 163, 74, 0.08)" : "#f0fdf4",
                border: "1px solid",
                borderColor: isDark ? "rgba(22, 163, 74, 0.2)" : "#dcfce7",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-3px)" }
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "#16a34a",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)"
                  }}
                >
                  <AddIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 0.8, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  Add Maintenance
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create a new maintenance log, assign technicians, and automatically adjust device availability.
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/maintenance/add")}
                endIcon={<AddIcon />}
                sx={{
                  bgcolor: isDark ? "rgba(22, 163, 74, 0.15)" : "#dcfce7",
                  color: "#16a34a",
                  fontWeight: 750,
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { bgcolor: isDark ? "rgba(22, 163, 74, 0.25)" : "#bbf7d0" }
                }}
              >
                Add New
              </Button>
            </Card>
          </Grid>

          {/* 3. Maintenance History */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: 3.5,
                bgcolor: isDark ? "rgba(37, 99, 235, 0.08)" : "#eff6ff",
                border: "1px solid",
                borderColor: isDark ? "rgba(37, 99, 235, 0.2)" : "#dbeafe",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-3px)" }
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "#2563eb",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                  }}
                >
                  <HistoryIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 0.8, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  Maintenance History
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review historical repair logs, resolution timelines, technician notes, and historical expenditure.
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/maintenance/history")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: isDark ? "rgba(37, 99, 235, 0.15)" : "#dbeafe",
                  color: "#2563eb",
                  fontWeight: 750,
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { bgcolor: isDark ? "rgba(37, 99, 235, 0.25)" : "#bfdbfe" }
                }}
              >
                View History
              </Button>
            </Card>
          </Grid>

          {/* 4. Reports & Analytics */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.8,
                borderRadius: 3.5,
                bgcolor: isDark ? "rgba(234, 88, 12, 0.08)" : "#fff7ed",
                border: "1px solid",
                borderColor: isDark ? "rgba(234, 88, 12, 0.2)" : "#ffedd5",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-3px)" }
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "#ea580c",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                    boxShadow: "0 4px 12px rgba(234, 88, 12, 0.25)"
                  }}
                >
                  <BarChartIcon fontSize="medium" />
                </Box>
                <Typography variant="h6" fontWeight={750} sx={{ mb: 0.8, color: isDark ? "#f8fafc" : "#0f172a" }}>
                  Reports & Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Export analytical breakdown reports, failure rates, downtime metrics, and resource costs.
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/technician/reports")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: isDark ? "rgba(234, 88, 12, 0.15)" : "#ffedd5",
                  color: "#ea580c",
                  fontWeight: 750,
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  "&:hover": { bgcolor: isDark ? "rgba(234, 88, 12, 0.25)" : "#fed7aa" }
                }}
              >
                View Reports
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt={2}
          pb={1}
          borderTop="1px solid"
          borderColor={isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
        >
          <Typography variant="caption" color="text.secondary">
            © 2025 Lab Platform. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Version 1.0.0
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
};

export default MaintenanceDashboard;
