import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ScienceIcon from "@mui/icons-material/Science";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import api from "../api/axiosConfig";

export default function AdminReports() {
  const [userReport, setUserReport] = useState({ total: 0, students: 0, techs: 0, managers: 0 });
  const [equipReport, setEquipReport] = useState({ total: 0, available: 0, maintenance: 0 });
  const [bookingReport, setBookingReport] = useState({ total: 0, approved: 0, pending: 0, cancelled: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersResp, equipResp, bookingsResp] = await Promise.allSettled([
        api.get("/users"),
        api.get("/equipment"),
        api.get("/bookings"),
      ]);

      let usersList = [];
      let equipList = [];
      let bookingsList = [];

      if (usersResp.status === "fulfilled") {
        usersList = usersResp.value.data || [];
      } else {
        usersList = MOCK_USERS;
      }

      if (equipResp.status === "fulfilled") {
        equipList = equipResp.value.data || [];
      } else {
        equipList = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        bookingsList = bookingsResp.value.data || [];
      } else {
        bookingsList = MOCK_BOOKINGS;
      }

      // User stats
      const totalUsers = usersList.length;
      const students = usersList.filter((u) => u.role?.toLowerCase() === "student").length;
      const techs = usersList.filter(
        (u) =>
          u.role?.toLowerCase() === "lab technician" || u.role?.toLowerCase() === "technician"
      ).length;
      const managers = usersList.filter(
        (u) =>
          u.role?.toLowerCase() === "lab manager" || u.role?.toLowerCase() === "manager"
      ).length;

      // Equipment stats
      const totalEquip = equipList.length;
      const available = equipList.filter((e) => e.status?.toLowerCase() === "available").length;
      const maintenance = equipList.filter(
        (e) =>
          e.status?.toLowerCase() === "maintenance" ||
          e.status?.toLowerCase() === "under maintenance"
      ).length;

      // Booking stats
      const totalBookings = bookingsList.length;
      const approved = bookingsList.filter((b) => b.status?.toLowerCase() === "approved").length;
      const pending = bookingsList.filter((b) => b.status?.toLowerCase() === "pending").length;
      const cancelled = bookingsList.filter((b) => b.status?.toLowerCase() === "cancelled" || b.status?.toLowerCase() === "rejected").length;

      setUserReport({ total: totalUsers, students, techs, managers });
      setEquipReport({ total: totalEquip, available, maintenance });
      setBookingReport({ total: totalBookings, approved, pending, cancelled });
    } catch (err) {
      console.error("Error creating reports overview:", err);
      setError("Cannot synchronize operational metrics from server. Displaying mock summary.");
      setUserReport({ total: 10, students: 6, techs: 2, managers: 2 });
      setEquipReport({ total: 6, available: 4, maintenance: 1 });
      setBookingReport({ total: 8, approved: 5, pending: 2, cancelled: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getPercentage = (sub, total) => {
    return total > 0 ? Math.round((sub / total) * 100) : 0;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Analytical Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          View user metrics, equipment availability indexes, and bookings status breakdowns.
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* User Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <PeopleIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  User Report
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Total Registered Users: <strong>{userReport.total}</strong>
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Students ({userReport.students})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(userReport.students, userReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(userReport.students, userReport.total)} color="primary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Technicians ({userReport.techs})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(userReport.techs, userReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(userReport.techs, userReport.total)} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Managers ({userReport.managers})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(userReport.managers, userReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(userReport.managers, userReport.total)} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <ScienceIcon color="secondary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Equipment Report
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Total Catalog Items: <strong>{equipReport.total}</strong>
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Available ({equipReport.available})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(equipReport.available, equipReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(equipReport.available, equipReport.total)} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>In Maintenance ({equipReport.maintenance})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(equipReport.maintenance, equipReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(equipReport.maintenance, equipReport.total)} color="error" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Report */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                <CalendarTodayIcon sx={{ color: "#8b5cf6" }} fontSize="large" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Booking Report
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Total Bookings Log: <strong>{bookingReport.total}</strong>
              </Typography>
              
              <Divider sx={{ my: 2 }} />

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Approved ({bookingReport.approved})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(bookingReport.approved, bookingReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(bookingReport.approved, bookingReport.total)} color="success" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Pending ({bookingReport.pending})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(bookingReport.pending, bookingReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(bookingReport.pending, bookingReport.total)} color="warning" sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Box mb={1}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Cancelled / Rejected ({bookingReport.cancelled})</Typography>
                  <Typography variant="caption" fontWeight={600}>{getPercentage(bookingReport.cancelled, bookingReport.total)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={getPercentage(bookingReport.cancelled, bookingReport.total)} color="error" sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

const MOCK_USERS = [
  { id: "1", role: "Student" },
  { id: "2", role: "Student" },
  { id: "3", role: "Lab Technician" },
  { id: "4", role: "Lab Manager" },
  { id: "5", role: "System Admin" },
];

const MOCK_EQUIPMENT = [
  { id: "1", status: "Available" },
  { id: "2", status: "Available" },
  { id: "3", status: "Maintenance" },
];

const MOCK_BOOKINGS = [
  { id: "101", status: "Approved" },
  { id: "102", status: "Pending" },
  { id: "103", status: "Rejected" },
];
