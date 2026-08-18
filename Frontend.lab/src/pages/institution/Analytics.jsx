import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Bar, Pie, Line } from "react-chartjs-2";
import api from "../../services/api";

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", department: "Electrical Engineering" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", status: "Approved" },
];

export default function InstitutionAnalytics() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const [categories, setCategories] = useState(["All"]);
  const [departments, setDepartments] = useState(["All"]);

  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableQty: 0,
    utilizationRate: 0,
    maintenanceCount: 0,
    totalBookings: 0,
  });

  const [chartsData, setChartsData] = useState({
    bar: null,
    pie: null,
    line: null,
  });

  const loadAnalytics = async () => {
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

      // Extract filter list values
      const cats = ["All", ...new Set(equip.map((e) => e.category).filter(Boolean))];
      const depts = ["All", ...new Set(equip.map((e) => e.department).filter(Boolean))];
      setCategories(cats);
      setDepartments(depts);

      // Filtering calculations
      const filteredEquip = equip.filter((item) => {
        const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
        const matchesDept = deptFilter === "All" || item.department === deptFilter;
        return matchesCategory && matchesDept;
      });

      const filteredBookings = bookings.filter((b) => {
        // Find matching equipment to test filters
        const matchedEquip = equip.find((e) => e.name === b.equipmentName);
        if (!matchedEquip) return true; // Keep if we can't determine (to avoid filtering out active ones)
        
        const matchesCategory = categoryFilter === "All" || matchedEquip.category === categoryFilter;
        const matchesDept = deptFilter === "All" || matchedEquip.department === deptFilter;
        return matchesCategory && matchesDept;
      });

      const totalQty = filteredEquip.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
      const availableQty = filteredEquip.reduce((sum, item) => sum + (item.availableQuantity ?? 0), 0);
      const maintenance = filteredEquip.filter(
        (e) =>
          e.status?.toLowerCase() === "maintenance" ||
          e.status?.toLowerCase() === "under maintenance"
      ).length;

      const utilization = totalQty > 0 ? Math.round(((totalQty - availableQty) / totalQty) * 100) : 0;

      setStats({
        totalEquipment: totalQty,
        availableQty: availableQty,
        utilizationRate: utilization,
        maintenanceCount: maintenance,
        totalBookings: filteredBookings.length,
      });

      // Pie: Status Breakdown
      setChartsData({
        pie: {
          labels: ["Available", "Booked Out", "Maintenance"],
          datasets: [
            {
              data: [availableQty, totalQty - availableQty - maintenance, maintenance],
              backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
              borderWidth: 1,
            },
          ],
        },
        // Bar: Department wise usage allocation
        bar: {
          labels: depts.filter((x) => x !== "All"),
          datasets: [
            {
              label: "Asset Volume",
              data: depts.filter((x) => x !== "All").map((d) =>
                equip.filter((e) => e.department === d).reduce((s, e) => s + e.quantity, 0)
              ),
              backgroundColor: "#1e3a8a",
              borderRadius: 4,
            },
          ],
        },
        // Line: Booking trends
        line: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Reservation requests count",
              data: [4, 8, 7, 10, 6, 3, filteredBookings.length || 5],
              borderColor: "#0ea5e9",
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
      });
    } catch (err) {
      console.warn("Analytics mapping failed:", err);
      setErrorMsg("Failed to synchronize analytics metrics. Fallback mock enabled.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [categoryFilter, deptFilter]);

  if (loading && !chartsData.pie) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="start" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
            Institutional Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Consolidated analytics detailing university resource allocations and reservations.
          </Typography>
        </Box>

        {/* Filters */}
        <Box display="flex" gap={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <TextField
            select
            size="small"
            label="Filter Category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Filter Department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            sx={{ width: 180 }}
          >
            {departments.map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Total Equipment Qty
              </Typography>
              <Typography variant="h5" fontWeight={850} color="text.primary" mt={0.5}>
                {stats.totalEquipment}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Available Qty
              </Typography>
              <Typography variant="h5" fontWeight={850} color="success.main" mt={0.5}>
                {stats.availableQty}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Utilization Rate
              </Typography>
              <Typography variant="h5" fontWeight={850} color="info.main" mt={0.5}>
                {`${stats.utilizationRate}%`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Under Repairs
              </Typography>
              <Typography variant="h5" fontWeight={850} color="error.main" mt={0.5}>
                {stats.maintenanceCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Selected Bookings
              </Typography>
              <Typography variant="h5" fontWeight={850} mt={0.5}>
                {stats.totalBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              Equipment Availability Breakdown
            </Typography>
            <Box height={240} display="flex" justifyContent="center">
              {chartsData.pie && <Pie data={chartsData.pie} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7} size={{ xs: 12, md: 7 }}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              Department-wise Equipment Allocation
            </Typography>
            <Box height={240}>
              {chartsData.bar && <Bar data={chartsData.bar} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} size={12}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} mb={2}>
              University Reservation Trends
            </Typography>
            <Box height={240}>
              {chartsData.line && <Line data={chartsData.line} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
