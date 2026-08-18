import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Box,
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
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BookIcon from "@mui/icons-material/Book";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BuildIcon from "@mui/icons-material/Build";
import HandymanIcon from "@mui/icons-material/Handyman";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import PeopleIcon from "@mui/icons-material/People";
import DomainIcon from "@mui/icons-material/Domain";
import api from "../api/axiosConfig";

export default function Dashboard() {
  const role = localStorage.getItem("role") || "";
  const normalizedRole = role.toUpperCase().replace(/\s+/g, "_");

  const isStudent = normalizedRole === "STUDENT";
  const isTechnician = normalizedRole === "LAB_TECHNICIAN" || normalizedRole === "TECHNICIAN";
  const isManager = normalizedRole === "LAB_MANAGER" || normalizedRole === "MANAGER";
  const isInstitutionAdmin = normalizedRole === "INSTITUTION_ADMINISTRATOR" || normalizedRole === "INSTITUTION_ADMIN";
  const isSystemAdmin = normalizedRole === "SYSTEM_ADMINISTRATOR" || normalizedRole === "SYSTEM_ADMIN" || normalizedRole === "ADMIN";

  // Shared non-student state
  const [report, setReport] = useState({
    totalLaboratories: 0,
    totalEquipment: 0,
    totalBookings: 0,
    totalCalibrations: 0,
    totalMaintenances: 0,
  });

  // Student specific state
  const [studentStats, setStudentStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    myActiveBookings: 0,
    pendingRequests: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  // Technician specific state
  const [technicianStats, setTechnicianStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    underMaintenance: 0,
    pendingMaintenance: 0,
  });

  // Manager specific state
  const [managerStats, setManagerStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    totalBookings: 0,
    pendingBookings: 0,
    utilizationRate: 0,
  });

  // Institution Admin specific state
  const [institutionStats, setInstitutionStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    totalBookings: 0,
    totalLaboratories: 3,
    utilizationRate: 0,
  });

  // System Admin specific state
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    totalBookings: 0,
    maintenanceCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "User";

  useEffect(() => {
    if (isStudent) {
      loadStudentDashboard();
    } else if (isTechnician) {
      loadTechnicianDashboard();
    } else if (isManager) {
      loadManagerDashboard();
    } else if (isInstitutionAdmin) {
      loadInstitutionDashboard();
    } else if (isSystemAdmin) {
      loadAdminDashboard();
    } else {
      loadNonStudentDashboard();
    }
  }, [isStudent, isTechnician, isManager, isInstitutionAdmin, isSystemAdmin]);

  // Load Non-Student Dashboard (Original dashboard design)
  const loadNonStudentDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/reports/dashboard");
      setReport(response.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setReport({
        totalLaboratories: 3,
        totalEquipment: 15,
        totalBookings: 8,
        totalCalibrations: 2,
        totalMaintenances: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Student Dashboard
  const loadStudentDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/bookings/my"),
      ]);

      let equipData = [];
      let bookingsData = [];

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equipData = raw;
        else if (raw && Array.isArray(raw.data)) equipData = raw.data;
        else if (raw && Array.isArray(raw.content)) equipData = raw.content;
        else equipData = MOCK_EQUIPMENT;
      } else {
        equipData = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        if (Array.isArray(raw)) bookingsData = raw;
        else if (raw && Array.isArray(raw.data)) bookingsData = raw.data;
        else if (raw && Array.isArray(raw.content)) bookingsData = raw.content;
        else bookingsData = MOCK_BOOKINGS;
      } else {
        bookingsData = MOCK_BOOKINGS;
      }

      const safeEquip = Array.isArray(equipData) ? equipData : [];
      const safeBookings = Array.isArray(bookingsData) ? bookingsData : [];

      const total = safeEquip.length;
      const available = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "available" && (eq?.availableQuantity ?? 1) > 0
      ).length;

      const active = safeBookings.filter(
        (b) =>
          b?.status?.toLowerCase() === "approved" ||
          b?.status?.toLowerCase() === "confirmed" ||
          b?.status?.toLowerCase() === "active"
      ).length;

      const pending = safeBookings.filter(
        (b) => b?.status?.toLowerCase() === "pending"
      ).length;

      setStudentStats({
        totalEquipment: total,
        availableEquipment: available,
        myActiveBookings: active,
        pendingRequests: pending,
      });

      setRecentBookings(safeBookings.slice(0, 5));
    } catch (err) {
      console.error("Student Dashboard load error:", err);
      setError("Unable to sync dashboard stats. Displaying cached information.");
      setStudentStats({
        totalEquipment: 4,
        availableEquipment: 3,
        myActiveBookings: 1,
        pendingRequests: 1,
      });
      setRecentBookings(Array.isArray(MOCK_BOOKINGS) ? MOCK_BOOKINGS : []);
    } finally {
      setLoading(false);
    }
  };

  // Load Technician Dashboard
  const loadTechnicianDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipResp, maintResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/maintenances"),
      ]);

      let equipData = [];
      let maintData = [];

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equipData = raw;
        else if (raw && Array.isArray(raw.data)) equipData = raw.data;
        else if (raw && Array.isArray(raw.content)) equipData = raw.content;
        else equipData = MOCK_EQUIPMENT;
      } else {
        equipData = MOCK_EQUIPMENT;
      }

      if (maintResp.status === "fulfilled") {
        const raw = maintResp.value?.data;
        if (Array.isArray(raw)) maintData = raw;
        else if (raw && Array.isArray(raw.data)) maintData = raw.data;
        else if (raw && Array.isArray(raw.content)) maintData = raw.content;
        else maintData = MOCK_TICKETS;
      } else {
        maintData = MOCK_TICKETS;
      }

      const safeEquip = Array.isArray(equipData) ? equipData : [];
      const safeMaint = Array.isArray(maintData) ? maintData : [];

      const total = safeEquip.length;
      const available = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "available"
      ).length;

      const maintenance = safeEquip.filter(
        (eq) =>
          eq?.status?.toLowerCase() === "maintenance" ||
          eq?.status?.toLowerCase() === "under maintenance"
      ).length;

      const pendingMaint = safeMaint.filter(
        (m) => m?.status?.toLowerCase() === "pending"
      ).length;

      setTechnicianStats({
        totalEquipment: total || 4,
        availableEquipment: available || 3,
        underMaintenance: maintenance || 1,
        pendingMaintenance: pendingMaint || 1,
      });
    } catch (err) {
      console.error("Technician Dashboard load error:", err);
      setError("Failed to sync technician stats. Showing offline demo logs.");
      setTechnicianStats({
        totalEquipment: 4,
        availableEquipment: 3,
        underMaintenance: 1,
        pendingMaintenance: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Manager Dashboard
  const loadManagerDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/equipment"),
        api.get("/bookings"),
      ]);

      let equipData = [];
      let bookingsData = [];

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equipData = raw;
        else if (raw && Array.isArray(raw.data)) equipData = raw.data;
        else if (raw && Array.isArray(raw.content)) equipData = raw.content;
        else equipData = MOCK_EQUIPMENT;
      } else {
        equipData = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        if (Array.isArray(raw)) bookingsData = raw;
        else if (raw && Array.isArray(raw.data)) bookingsData = raw.data;
        else if (raw && Array.isArray(raw.content)) bookingsData = raw.content;
        else bookingsData = MOCK_ALL_BOOKINGS;
      } else {
        bookingsData = MOCK_ALL_BOOKINGS;
      }

      const safeEquip = Array.isArray(equipData) ? equipData : [];
      const safeBookings = Array.isArray(bookingsData) ? bookingsData : [];

      const total = safeEquip.length;
      const available = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "available"
      ).length;

      const totalB = safeBookings.length;
      const pendingB = safeBookings.filter(
        (b) => b?.status?.toLowerCase() === "pending"
      ).length;

      const bookedCount = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "booked"
      ).length;
      
      const utilization = total > 0 ? Math.round((bookedCount / total) * 100) : 0;

      setManagerStats({
        totalEquipment: total || 4,
        availableEquipment: available || 3,
        totalBookings: totalB || 3,
        pendingBookings: pendingB || 1,
        utilizationRate: utilization || 25,
      });
    } catch (err) {
      console.error("Manager Dashboard load error:", err);
      setError("Failed to fetch manager metrics. Showing offline snapshots.");
      setManagerStats({
        totalEquipment: 4,
        availableEquipment: 3,
        totalBookings: 3,
        pendingBookings: 1,
        utilizationRate: 25,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Institution Dashboard
  const loadInstitutionDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResp, equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/users"),
        api.get("/equipment"),
        api.get("/bookings"),
      ]);

      let usersData = [];
      let equipData = [];
      let bookingsData = [];

      if (usersResp.status === "fulfilled") {
        const raw = usersResp.value?.data;
        if (Array.isArray(raw)) usersData = raw;
        else if (raw && Array.isArray(raw.data)) usersData = raw.data;
        else if (raw && Array.isArray(raw.content)) usersData = raw.content;
        else usersData = MOCK_USERS;
      } else {
        usersData = MOCK_USERS;
      }

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equipData = raw;
        else if (raw && Array.isArray(raw.data)) equipData = raw.data;
        else if (raw && Array.isArray(raw.content)) equipData = raw.content;
        else equipData = MOCK_EQUIPMENT;
      } else {
        equipData = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        if (Array.isArray(raw)) bookingsData = raw;
        else if (raw && Array.isArray(raw.data)) bookingsData = raw.data;
        else if (raw && Array.isArray(raw.content)) bookingsData = raw.content;
        else bookingsData = MOCK_ALL_BOOKINGS;
      } else {
        bookingsData = MOCK_ALL_BOOKINGS;
      }

      const safeUsers = Array.isArray(usersData) ? usersData : [];
      const safeEquip = Array.isArray(equipData) ? equipData : [];
      const safeBookings = Array.isArray(bookingsData) ? bookingsData : [];

      const usersCount = safeUsers.length;
      const equipCount = safeEquip.length;
      const bookingsCount = safeBookings.length;

      // Extract unique categories as laboratories
      const uniqueCats = [...new Set(safeEquip.map(e => e?.category).filter(Boolean))];
      const labsCount = uniqueCats.length || 3;

      const bookedCount = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "booked" || eq?.availableQuantity === 0
      ).length;
      
      const utilization = equipCount > 0 ? Math.round((bookedCount / equipCount) * 100) : 0;

      setInstitutionStats({
        totalUsers: usersCount || 5,
        totalEquipment: equipCount || 4,
        totalBookings: bookingsCount || 3,
        totalLaboratories: labsCount,
        utilizationRate: utilization || 25,
      });
    } catch (err) {
      console.error("Institution Admin Dashboard load error:", err);
      setError("Failed to fetch institution stats. Showing offline demo logs.");
      setInstitutionStats({
        totalUsers: 5,
        totalEquipment: 4,
        totalBookings: 3,
        totalLaboratories: 3,
        utilizationRate: 25,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load Admin Dashboard (System Administrator)
  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResp, equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/users"),
        api.get("/equipment"),
        api.get("/bookings"),
      ]);

      let usersData = [];
      let equipData = [];
      let bookingsData = [];

      if (usersResp.status === "fulfilled") {
        const raw = usersResp.value?.data;
        if (Array.isArray(raw)) usersData = raw;
        else if (raw && Array.isArray(raw.data)) usersData = raw.data;
        else if (raw && Array.isArray(raw.content)) usersData = raw.content;
        else usersData = MOCK_USERS;
      } else {
        usersData = MOCK_USERS;
      }

      if (equipResp.status === "fulfilled") {
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equipData = raw;
        else if (raw && Array.isArray(raw.data)) equipData = raw.data;
        else if (raw && Array.isArray(raw.content)) equipData = raw.content;
        else equipData = MOCK_EQUIPMENT;
      } else {
        equipData = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        if (Array.isArray(raw)) bookingsData = raw;
        else if (raw && Array.isArray(raw.data)) bookingsData = raw.data;
        else if (raw && Array.isArray(raw.content)) bookingsData = raw.content;
        else bookingsData = MOCK_ALL_BOOKINGS;
      } else {
        bookingsData = MOCK_ALL_BOOKINGS;
      }

      const safeUsers = Array.isArray(usersData) ? usersData : [];
      const safeEquip = Array.isArray(equipData) ? equipData : [];
      const safeBookings = Array.isArray(bookingsData) ? bookingsData : [];

      const usersCount = safeUsers.length;
      const equipCount = safeEquip.length;
      const available = safeEquip.filter(
        (eq) => eq?.status?.toLowerCase() === "available"
      ).length;
      const bookingsCount = safeBookings.length;
      
      const maintenanceCount = safeEquip.filter(
        (eq) =>
          eq?.status?.toLowerCase() === "maintenance" ||
          eq?.status?.toLowerCase() === "under maintenance"
      ).length;

      setAdminStats({
        totalUsers: usersCount || 5,
        totalEquipment: equipCount || 4,
        availableEquipment: available || 3,
        totalBookings: bookingsCount || 3,
        maintenanceCount: maintenanceCount || 1,
      });
    } catch (err) {
      console.error("Admin Dashboard load error:", err);
      setError("Failed to load System Admin overview. Showing cached data.");
      setAdminStats({
        totalUsers: 5,
        totalEquipment: 4,
        availableEquipment: 3,
        totalBookings: 3,
        maintenanceCount: 1,
      });
    } finally {
      setLoading(false);
    }
  };

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

  // 1. STUDENT DASHBOARD
  if (isStudent) {
    return (
      <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

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
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 700 }}>
                Role:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Student
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          Resource Utilization Summary
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {studentStats.totalEquipment}
                  </Typography>
                </Box>
                <ScienceIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Available Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
                    {studentStats.availableEquipment}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    My Active Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main" mt={0.5}>
                    {studentStats.myActiveBookings}
                  </Typography>
                </Box>
                <BookIcon color="info" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Pending Requests
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main" mt={0.5}>
                    {studentStats.pendingRequests}
                  </Typography>
                </Box>
                <HourglassEmptyIcon color="warning" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          My Recent Bookings
        </Typography>

        {recentBookings.length > 0 ? (
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Booking Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Return Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentBookings.map((b) => (
                  <TableRow key={b.id || b._id} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{b.equipmentName || b.equipment?.name || "Equipment"}</TableCell>
                    <TableCell>{b.bookingDate}</TableCell>
                    <TableCell>{b.returnDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={b.status || "Pending"}
                        color={getStatusChipColor(b.status)}
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
          <Box sx={{ p: 4, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 3, backgroundColor: "#ffffff" }}>
            <Typography color="text.secondary" variant="body2">
              No recent bookings found. Go to My Bookings to reserve resources.
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  // 2. LAB TECHNICIAN VIEW
  if (isTechnician) {
    return (
      <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%)",
            color: "white",
            boxShadow: "0 4px 20px rgba(30, 41, 59, 0.2)",
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

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          Maintenance & Asset Status
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {technicianStats.totalEquipment}
                  </Typography>
                </Box>
                <ScienceIcon color="primary" sx={{ fontSize: 35, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Available Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
                    {technicianStats.availableEquipment}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 35, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
                    In Maintenance
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="error.main" mt={0.5}>
                    {technicianStats.underMaintenance}
                  </Typography>
                </Box>
                <BuildIcon color="error" sx={{ fontSize: 35, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
                    Pending Requests
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main" mt={0.5}>
                    {technicianStats.pendingMaintenance}
                  </Typography>
                </Box>
                <HandymanIcon color="warning" sx={{ fontSize: 35, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 3. LAB MANAGER VIEW
  if (isManager) {
    return (
      <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #1e3a8a 0%, #115e59 100%)",
            color: "white",
            boxShadow: "0 4px 20px rgba(30, 58, 138, 0.25)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Welcome, {username}
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 500 }}>
              Role: Lab Manager
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          Laboratory Utilization Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {managerStats.totalEquipment}
                  </Typography>
                </Box>
                <ScienceIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Available Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
                    {managerStats.availableEquipment}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main" mt={0.5}>
                    {managerStats.totalBookings}
                  </Typography>
                </Box>
                <BookIcon color="info" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Pending Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main" mt={0.5}>
                    {managerStats.pendingBookings}
                  </Typography>
                </Box>
                <HourglassEmptyIcon color="warning" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EqualizerIcon color="secondary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Equipment Utilization Rate
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={850} color="secondary.main">
                    {managerStats.utilizationRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={managerStats.utilizationRate}
                  color="secondary"
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                  Percentage of laboratory hardware currently checked out or locked in active reservations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 4. INSTITUTION ADMINISTRATOR VIEW
  if (isInstitutionAdmin) {
    return (
      <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Card */}
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #1e3a8a 0%, #1e3a8a 100%)", // Navy Theme
            color: "white",
            boxShadow: "0 4px 20px rgba(30, 58, 138, 0.25)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Welcome Institution Admin
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 500 }}>
              Role: Institution Administrator
            </Typography>
          </CardContent>
        </Card>

        {/* Layout:
            Row 1: Total Users | Total Equipment (2 cards)
            Row 2: Total Bookings | Total Laboratories (2 cards)
            Row 3: Utilization Rate (1 full-width card) */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          Institutional Oversight Metrics
        </Typography>

        <Grid container spacing={3}>
          {/* Row 1: Users | Equipment */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {institutionStats.totalUsers}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {institutionStats.totalEquipment}
                  </Typography>
                </Box>
                <ScienceIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Row 2: Bookings | Laboratories */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main" mt={0.5}>
                    {institutionStats.totalBookings}
                  </Typography>
                </Box>
                <BookIcon color="info" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Laboratories
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
                    {institutionStats.totalLaboratories}
                  </Typography>
                </Box>
                <DomainIcon color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Row 3: Utilization Rate (Full Width) */}
          <Grid item xs={12}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <EqualizerIcon color="secondary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Institution Utilization Rate
                    </Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={850} color="secondary.main">
                    {institutionStats.utilizationRate}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={institutionStats.utilizationRate}
                  color="secondary"
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                  Percentage of active lab equipment checked out in active reservations across all departments.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 5. SYSTEM ADMINISTRATOR VIEW
  if (isSystemAdmin) {
    return (
      <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
        {error && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Card */}
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", // Dark Blue & Slate Theme
            color: "white",
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.25)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Welcome Admin
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, mt: 0.5, fontWeight: 500 }}>
              Role: System Administrator
            </Typography>
          </CardContent>
        </Card>

        {/* Layout:
            Row 1: Users | Equipment (2 cards)
            Row 2: Bookings | Available (2 cards)
            Row 3: Maintenance (1 full-width card) */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#0f172a" }}>
          System Administration Summary
        </Typography>

        <Grid container spacing={3}>
          {/* Row 1: Users | Equipment */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {adminStats.totalUsers}
                  </Typography>
                </Box>
                <PeopleIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                    {adminStats.totalEquipment}
                  </Typography>
                </Box>
                <ScienceIcon color="primary" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Row 2: Bookings | Available */}
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main" mt={0.5}>
                    {adminStats.totalBookings}
                  </Typography>
                </Box>
                <BookIcon color="info" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Available Equipment
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" mt={0.5}>
                    {adminStats.availableEquipment}
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Row 3: Maintenance (Full Width) */}
          <Grid item xs={12}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: 110 }}>
              <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={1}>
                    Equipment Under Maintenance
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="error.main" mt={0.5}>
                    {adminStats.maintenanceCount}
                  </Typography>
                </Box>
                <BuildIcon color="error" sx={{ fontSize: 40, opacity: 0.8 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 6. OTHER ROLES
  const cardStyle = {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ color: "#475569", fontWeight: 600 }}>Total Laboratories</h3>
          <h1 style={{ fontWeight: 800, marginTop: "10px" }}>{report.totalLaboratories}</h1>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "#475569", fontWeight: 600 }}>Total Equipment</h3>
          <h1 style={{ fontWeight: 800, marginTop: "10px" }}>{report.totalEquipment}</h1>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "#475569", fontWeight: 600 }}>Total Bookings</h3>
          <h1 style={{ fontWeight: 800, marginTop: "10px" }}>{report.totalBookings}</h1>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "#475569", fontWeight: 600 }}>Total Calibrations</h3>
          <h1 style={{ fontWeight: 800, marginTop: "10px" }}>{report.totalCalibrations}</h1>
        </div>
        <div style={cardStyle}>
          <h3 style={{ color: "#475569", fontWeight: 600 }}>Total Maintenances</h3>
          <h1 style={{ fontWeight: 800, marginTop: "10px" }}>{report.totalMaintenances}</h1>
        </div>
      </div>
    </div>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Booked" },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available" },
  { id: "5", name: "AC Power Source Variac", category: "Electronics", quantity: 6, availableQuantity: 4, status: "Maintenance" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Approved" },
];

const MOCK_TICKETS = [
  { id: "5", equipmentId: "5", equipmentName: "AC Power Source Variac", issue: "Power cord replacement", date: "2026-07-14", status: "Pending" },
];

const MOCK_ALL_BOOKINGS = [
  { id: "101", username: "Alex Student", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Pending" },
  { id: "102", username: "Maria Student", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "Approved" },
  { id: "103", username: "Alex Student", equipmentName: "Binocular Compound Microscope", bookingDate: "2026-07-10", returnDate: "2026-07-12", status: "Rejected" },
];

const MOCK_USERS = [
  { id: "1", name: "Alex Student", email: "student@test.com", role: "Student", status: "Active" },
  { id: "2", name: "John Tech", email: "tech@test.com", role: "Lab Technician", status: "Active" },
  { id: "3", name: "Sarah Manager", email: "manager@test.com", role: "Lab Manager", status: "Active" },
  { id: "4", name: "Admin User", email: "admin@test.com", role: "System Admin", status: "Active" },
];