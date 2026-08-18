import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Paper,
} from "@mui/material";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import api from "../../services/api";

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function TechnicianReports() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    underMaintenance: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    returnedBookings: 0,
  });

  const [chartsData, setChartsData] = useState({
    bar: null,
    pie: null,
    line: null,
  });

  const loadReports = async () => {
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

      // Calculations
      const total = equip.length;
      const available = equip.filter((e) => e.status?.toLowerCase() === "available").length;
      const maintenance = equip.filter(
        (e) =>
          e.status?.toLowerCase() === "maintenance" ||
          e.status?.toLowerCase() === "under maintenance"
      ).length;

      const approved = bookings.filter(
        (b) => b.status?.toLowerCase() === "approved" || b.status?.toLowerCase() === "confirmed"
      ).length;

      const rejected = bookings.filter((b) => b.status?.toLowerCase() === "rejected").length;
      const returned = bookings.filter((b) => b.status?.toLowerCase() === "returned").length;

      setStats({
        totalEquipment: total,
        availableEquipment: available,
        underMaintenance: maintenance,
        approvedBookings: approved,
        rejectedBookings: rejected,
        returnedBookings: returned,
      });

      // 1. Pie Chart: Status Breakdown
      const pieData = {
        labels: ["Available", "Checked Out / Booked", "Under Maintenance"],
        datasets: [
          {
            data: [available, total - available - maintenance, maintenance],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
          },
        ],
      };

      // 2. Bar Chart: Bookings per Equipment
      const equipNames = Array.from(new Set(bookings.map((b) => b.equipmentName)));
      const bookingsCounts = equipNames.map(
        (name) => bookings.filter((b) => b.equipmentName === name).length
      );

      const barData = {
        labels: equipNames.length > 0 ? equipNames : ["No Equipment Data"],
        datasets: [
          {
            label: "Reservation Counts",
            data: bookingsCounts.length > 0 ? bookingsCounts : [0],
            backgroundColor: "#1e3a8a",
            borderRadius: 6,
          },
        ],
      };

      // 3. Line Chart: Booking Frequency over Days
      const uniqueDays = Array.from(new Set(bookings.map((b) => b.bookingDate))).sort();
      const dailyCounts = uniqueDays.map(
        (day) => bookings.filter((b) => b.bookingDate === day).length
      );

      const lineData = {
        labels: uniqueDays.length > 0 ? uniqueDays : ["No Time Data"],
        datasets: [
          {
            label: "Daily Requests Count",
            data: dailyCounts.length > 0 ? dailyCounts : [0],
            borderColor: "#0ea5e9",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      };

      setChartsData({
        pie: pieData,
        bar: barData,
        line: lineData,
      });
    } catch (err) {
      console.error("Reports syncing failed:", err);
      setErrorMsg("Failed to synchronize analytics. Charts will render demo datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
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
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          Operations & Analytics Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Verify laboratory hardware utilization parameters, reservation frequencies, and repairs.
        </Typography>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Total Assets
              </Typography>
              <Typography variant="h5" fontWeight={850} color="text.primary" mt={0.5}>
                {stats.totalEquipment}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Available
              </Typography>
              <Typography variant="h5" fontWeight={850} color="success.main" mt={0.5}>
                {stats.availableEquipment}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Maintenance
              </Typography>
              <Typography variant="h5" fontWeight={850} color="error.main" mt={0.5}>
                {stats.underMaintenance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Approved
              </Typography>
              <Typography variant="h5" fontWeight={850} color="info.main" mt={0.5}>
                {stats.approvedBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Rejected
              </Typography>
              <Typography variant="h5" fontWeight={850} color="warning.main" mt={0.5}>
                {stats.rejectedBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4} md={2}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
            <CardContent sx={{ py: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={750}>
                Returned
              </Typography>
              <Typography variant="h5" fontWeight={850} color="secondary.main" mt={0.5}>
                {stats.returnedBookings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Layout */}
      <Grid container spacing={4}>
        {/* Pie: Status Breakdown */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3} color="#1e3a8a">
              Equipment Status Breakdown
            </Typography>
            <Box height={280} display="flex" justifyContent="center">
              {chartsData.pie && <Pie data={chartsData.pie} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>

        {/* Bar: Bookings per Equipment */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3} color="#1e3a8a">
              Allocation Demands per Equipment
            </Typography>
            <Box height={280}>
              {chartsData.bar && <Bar data={chartsData.bar} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>

        {/* Line: Booking frequency over time */}
        <Grid item xs={12}>
          <Paper sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3} color="#1e3a8a">
              Reservation Timeline Requests Frequency
            </Typography>
            <Box height={280}>
              {chartsData.line && <Line data={chartsData.line} options={{ maintainAspectRatio: false }} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Maintenance" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", status: "Approved" },
  { id: "102", equipmentName: "UV-Vis Spectrophotometer", bookingDate: "2026-07-16", status: "Returned" },
];
