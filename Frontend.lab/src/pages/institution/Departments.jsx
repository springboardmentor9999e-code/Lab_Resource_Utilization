import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ApartmentIcon from "@mui/icons-material/Apartment";
import api from "../../services/api";

const DEFAULT_DEPTS = [
  { name: "Electrical Engineering", equipmentCount: 12, bookingCount: 45, utilization: 68 },
  { name: "Computer Science & Engineering", equipmentCount: 18, bookingCount: 92, utilization: 82 },
  { name: "Applied Chemistry", equipmentCount: 6, bookingCount: 18, utilization: 40 },
  { name: "Mechanical Engineering", equipmentCount: 8, bookingCount: 22, utilization: 55 },
];

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", department: "Electrical Engineering" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", status: "Approved" },
];

export default function InstitutionDepartments() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const loadDepartments = async () => {
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
        equip = equipResp.value.data || [];
      } else {
        equip = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        bookings = bookingsResp.value.data || [];
      } else {
        bookings = MOCK_BOOKINGS;
      }

      const deptsMap = {};

      equip.forEach((item) => {
        const dept = item.department || "General Lab Services";
        if (!deptsMap[dept]) {
          deptsMap[dept] = { name: dept, equipmentCount: 0, totalQty: 0, availableQty: 0, bookingCount: 0 };
        }
        deptsMap[dept].equipmentCount += 1;
        deptsMap[dept].totalQty += item.quantity || 1;
        deptsMap[dept].availableQty += item.availableQuantity ?? 1;
      });

      bookings.forEach((b) => {
        const matchedEquip = equip.find((e) => e.name === b.equipmentName);
        const dept = matchedEquip?.department || "General Lab Services";
        if (deptsMap[dept]) {
          deptsMap[dept].bookingCount += 1;
        }
      });

      const deptsList = Object.values(deptsMap).map((d) => {
        const utilization = d.totalQty > 0 ? Math.round(((d.totalQty - d.availableQty) / d.totalQty) * 100) : 0;
        return {
          ...d,
          utilization: utilization,
        };
      });

      setDepartments(deptsList.length > 0 ? deptsList : DEFAULT_DEPTS);
    } catch (err) {
      console.warn("Telemetry aggregation failed. Loading default department cards.", err);
      setDepartments(DEFAULT_DEPTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const filteredDepts = departments.filter((d) =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && departments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress size={44} />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="start" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "#f8fafc" : "#1e3a8a" }}>
            University Departments
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Verify equipment allocations and reservation utilization rates per academic department.
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "text.disabled", mr: 1 }} />,
          }}
          sx={{
            width: { xs: "100%", sm: 260 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
            },
          }}
        />
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {filteredDepts.map((d, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
                backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
                boxShadow: isDark ? "0 4px 15px rgba(0,0,0,0.2)" : "0 4px 15px rgba(15,23,42,0.03)",
                borderRadius: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                },
              }}
            >
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Avatar sx={{ backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff", color: "#3b82f6" }}>
                    <ApartmentIcon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={800} color={isDark ? "#f8fafc" : "#0f172a"}>
                    {d.name}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Asset Count
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={750} color={isDark ? "#f8fafc" : "#0f172a"}>
                      {d.equipmentCount} devices
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Total Bookings
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={750} color={isDark ? "#f8fafc" : "#0f172a"}>
                      {d.bookingCount} times
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Utilization Rate
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={750} color="info.main">
                      {`${d.utilization}%`}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: isDark ? "#f8fafc" : "#0f172a" }}>
        Telemetry Details Matrix
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 4,
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
          backgroundColor: isDark ? "rgba(30, 41, 59, 0.7)" : "#ffffff",
          overflow: "hidden",
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.4)" : "#f8fafc" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }}>Department Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }} align="center">Equipment Count</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }} align="center">Total Bookings Count</TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? "#94a3b8" : "#475569" }} align="center">Resource Utilization Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDepts.length > 0 ? (
              filteredDepts.map((d, index) => (
                <TableRow key={index} sx={{ "&:hover": { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc" } }}>
                  <TableCell sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>{d.name}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>{d.equipmentCount}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? "#f8fafc" : "#0f172a" }}>{d.bookingCount}</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "info.main" }}>
                    {`${d.utilization}%`}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No departments recorded.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
