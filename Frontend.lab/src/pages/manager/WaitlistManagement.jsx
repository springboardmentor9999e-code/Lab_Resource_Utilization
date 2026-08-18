import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Snackbar,
  useTheme,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  AreaChart,
  Area,
} from "recharts";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoIcon from "@mui/icons-material/Info";
import api from "../../services/api";

// Fallback Mock Waitlist Data
const MOCK_WAITLIST_QUEUE = [
  { id: "w701", studentName: "Daniel Carter", equipmentName: "Ultrafast Spectrophotometer", position: 1, priority: "Emergency", requestedDate: "2026-07-19", status: "Waiting" },
  { id: "w702", studentName: "Emily Watson", equipmentName: "Ultrafast Spectrophotometer", position: 2, priority: "Urgent", requestedDate: "2026-07-18", status: "Waiting" },
  { id: "w703", studentName: "Marcus Vance", equipmentName: "DNA Sequencer NextGen", position: 1, priority: "Urgent", requestedDate: "2026-07-19", status: "Waiting" },
  { id: "w704", studentName: "Sophia Martinez", equipmentName: "Gas Chromatograph MS", position: 1, priority: "Standard", requestedDate: "2026-07-17", status: "Waiting" },
  { id: "w705", studentName: "Liam Johnson", equipmentName: "High-Frequency Oscilloscope", position: 1, priority: "Standard", requestedDate: "2026-07-19", status: "Waiting" },
];

const MOCK_MOST_REQUESTED = [
  { name: "Spectrophotometer", requests: 48 },
  { name: "DNA Sequencer", requests: 36 },
  { name: "Oscilloscope", requests: 28 },
  { name: "Gas Chromatograph", requests: 22 },
  { name: "Thermal Cycler", requests: 18 },
];

const MOCK_PEAK_HOURS = [
  { hour: "08:00", volume: 15 },
  { hour: "10:00", volume: 45 },
  { hour: "12:00", volume: 30 },
  { hour: "14:00", volume: 55 },
  { hour: "16:00", volume: 50 },
  { hour: "18:00", volume: 20 },
  { hour: "20:00", volume: 10 },
];

const MOCK_PREDICTION_CARDS = [
  {
    id: "p1",
    title: "Mid-Term Project Peak Demand",
    description: "Biotech lab demand predicted to surge 45% in next 10 days. DNA Sequencer waitlist is expected to grow by 5 slots.",
    action: "Recommendation: Reallocate 1 idle sequencer from secondary chemistry laboratory.",
    severity: "error",
  },
  {
    id: "p2",
    title: "Equipment Availability Alert",
    description: "A scheduled maintenance of 3 Oscilloscopes begins next Monday. This will likely trigger waitlists for engineering students.",
    action: "Recommendation: Restrict single booking duration to 2 hours maximum to optimize turnaround.",
    severity: "warning",
  },
  {
    id: "p3",
    title: "Off-Peak Booking Incentive",
    description: "Peak hours analysis shows 75% load between 10:00-16:00, while 08:00-10:00 and 18:00-20:00 slots remain mostly empty.",
    action: "Recommendation: Advise student groups to utilize early morning and late evening slots.",
    severity: "info",
  },
];

export default function ManagerWaitlistManagement() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [waitlist, setWaitlist] = useState(MOCK_WAITLIST_QUEUE);
  const [successMsg, setSuccessMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isDark = theme.palette.mode === "dark";

  const fetchWaitlistData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/waitlist");
      const apiData = Array.isArray(response.data) ? response.data : (response.data?.data || MOCK_WAITLIST_QUEUE);
      const localList = JSON.parse(localStorage.getItem("local_waitlist") || "[]").map((item) => ({
        id: item.id || `w-${Math.floor(Math.random() * 1000)}`,
        studentName: item.studentName || "Student",
        equipmentName: item.equipmentName || "Lab Resource",
        position: item.queuePosition || 1,
        priority: item.priority || "Standard",
        requestedDate: item.requestDate || new Date().toISOString().split("T")[0],
        status: item.status || "Waiting",
      }));
      setWaitlist([...apiData, ...localList]);
    } catch (err) {
      console.warn("Waitlist endpoints not found. Operating with local evaluations.");
      const localList = JSON.parse(localStorage.getItem("local_waitlist") || "[]").map((item) => ({
        id: item.id || `w-${Math.floor(Math.random() * 1000)}`,
        studentName: item.studentName || "Student",
        equipmentName: item.equipmentName || "Lab Resource",
        position: item.queuePosition || 1,
        priority: item.priority || "Standard",
        requestedDate: item.requestDate || new Date().toISOString().split("T")[0],
        status: item.status || "Waiting",
      }));
      setWaitlist([...MOCK_WAITLIST_QUEUE, ...localList]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const handleAutoAllocate = () => {
    // Simulate auto allocation algorithm running
    setWaitlist((prevQueue) => {
      // Find the emergency queue and simulate allocating it
      return prevQueue.map((item) => {
        if (item.priority === "Emergency" && item.status === "Waiting") {
          return { ...item, status: "Auto-allocated" };
        }
        return item;
      });
    });
    setSuccessMsg("Successfully executed Auto-Allocation algorithm. Emergency requests matched and notified!");
    setSnackbarOpen(true);
  };

  const handleResolveSingle = (id) => {
    setWaitlist((prev) => prev.filter((item) => item.id !== id));
    setSuccessMsg(`Booking allocation successfully resolved for Request ID: ${id}`);
    setSnackbarOpen(true);
  };

  const getPriorityColor = (p) => {
    switch (p?.toLowerCase()) {
      case "emergency":
        return "error";
      case "urgent":
        return "warning";
      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh" flexDirection="column" gap={2}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Calculating waitlist queue priorities...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            Waitlist &amp; Demand Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage booking conflicts, run automated queue allocation, and view demand predictions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<AutoFixHighIcon />}
          onClick={handleAutoAllocate}
          sx={{ boxShadow: "none", fontWeight: 700 }}
        >
          Run Auto-Allocation Algorithm
        </Button>
      </Box>

      {/* Main Waitlist Queue Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={750}>
                Active Waitlist Queue
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Real-time booking queue displaying priorities and matching status.
              </Typography>
            </Box>
            <Chip label={`${waitlist.length} Pending Requests`} color="primary" size="small" sx={{ fontWeight: 700 }} />
          </Box>

          <TableContainer component={Paper} sx={{ border: `1px solid ${theme.palette.divider}`, boxShadow: "none" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>User Name</TableCell>
                  <TableCell>Equipment Name</TableCell>
                  <TableCell>Date Requested</TableCell>
                  <TableCell>Queue Position</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Matching Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waitlist.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 650 }}>{item.id}</TableCell>
                    <TableCell>{item.studentName}</TableCell>
                    <TableCell sx={{ fontWeight: 550 }}>{item.equipmentName}</TableCell>
                    <TableCell>{item.requestedDate}</TableCell>
                    <TableCell align="center">
                      <Chip label={`#${item.position}`} size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={item.priority} size="small" color={getPriorityColor(item.priority)} sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        variant="filled"
                        color={item.status === "Auto-allocated" ? "success" : "default"}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.status === "Auto-allocated" ? (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          onClick={() => handleResolveSingle(item.id)}
                          sx={{ fontWeight: 700 }}
                        >
                          Complete Allocation
                        </Button>
                      ) : (
                        <Button
                          variant="text"
                          color="primary"
                          size="small"
                          onClick={() => handleResolveSingle(item.id)}
                          sx={{ fontWeight: 700 }}
                        >
                          Manual Match
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Demand Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Most Requested Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                Most Requested Equipment Tiers
              </Typography>
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MOST_REQUESTED} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <ChartTooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: theme.palette.divider }} />
                    <Bar name="Reservation Log Count" dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Booking Hours Area Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                Peak Booking Hours Load (Daily Logs)
              </Typography>
              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_PEAK_HOURS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPeak" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="hour" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <ChartTooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: theme.palette.divider }} />
                    <Area name="Active Bookings Load" type="monotone" dataKey="volume" stroke="#10b981" fillOpacity={1} fill="url(#colorPeak)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demand Analysis Prediction Cards */}
      <Box mb={2}>
        <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
          Machine Learning Demand Forecasting &amp; Prediction Cards
        </Typography>
        <Grid container spacing={3}>
          {MOCK_PREDICTION_CARDS.map((card) => (
            <Grid item xs={12} md={4} key={card.id}>
              <Card
                sx={{
                  borderLeft: `5px solid ${
                    card.severity === "error"
                      ? theme.palette.error.main
                      : card.severity === "warning"
                      ? theme.palette.warning.main
                      : theme.palette.info.main
                  }`,
                  height: "100%",
                }}
              >
                <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <TrendingUpIcon
                      color={
                        card.severity === "error"
                          ? "error"
                          : card.severity === "warning"
                          ? "warning"
                          : "info"
                      }
                    />
                    <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "15px" }}>
                      {card.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                    {card.description}
                  </Typography>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
                      <InfoIcon fontSize="small" sx={{ fontSize: "14px" }} />
                      Actionable Plan:
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {card.action}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={successMsg}
      />
    </Box>
  );
}
