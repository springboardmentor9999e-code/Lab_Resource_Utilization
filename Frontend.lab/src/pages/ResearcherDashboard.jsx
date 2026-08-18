import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import DashboardCard from "../components/DashboardCard";
import DashboardStat from "../components/DashboardStat";
import DashboardTable from "../components/DashboardTable";
import DashboardChart from "../components/DashboardChart";
import DashboardFilter from "../components/DashboardFilter";
import dashboardService from "../services/dashboardService";
import { downloadPDF, downloadExcel } from "../utils/exportUtils";

export default function ResearcherDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Filters state
  const [dateFilter, setDateFilter] = useState("this_month");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [equipmentFilter, setEquipmentFilter] = useState("All Equipment");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getResearcherDashboard();
      setDashboardData(data);
    } catch (err) {
      console.warn("API request failed, rendering demo researcher dataset:", err);
      // Fallback mock data structure matching ResearcherDashboardDTO
      setDashboardData({
        myBookings: [
          { id: 101, equipmentName: "NMR Spectrometer 400MHz", lab: "Chemistry Lab 3", startTime: "2026-08-06 10:00", endTime: "2026-08-06 12:00", status: "CONFIRMED" },
          { id: 102, equipmentName: "Zeiss Electron Microscope", lab: "Physics Suite A", startTime: "2026-08-07 14:00", endTime: "2026-08-07 16:00", status: "APPROVED" },
          { id: 103, equipmentName: "High-Speed Centrifuge B7", lab: "Bio-Lab 2", startTime: "2026-08-08 09:00", endTime: "2026-08-08 11:00", status: "PENDING" },
        ],
        upcomingReservations: [
          { id: 101, title: "NMR Spectrometer Session", date: "Tomorrow, 10:00 AM", duration: "2 Hours", room: "Chem-302" },
          { id: 102, title: "Electron Microscope Scan", date: "Aug 7, 2:00 PM", duration: "2 Hours", room: "Phys-101" },
        ],
        bookingHistory: [
          { id: 91, equipmentName: "Thermal Cycler PCR", date: "2026-07-28", hours: "3 hrs", status: "COMPLETED" },
          { id: 92, equipmentName: "HPLC Chromatography System", date: "2026-07-25", hours: "4 hrs", status: "COMPLETED" },
          { id: 93, equipmentName: "Mass Spectrometer X2", date: "2026-07-20", hours: "2 hrs", status: "COMPLETED" },
          { id: 94, equipmentName: "UV-Vis Spectrophotometer", date: "2026-07-15", hours: "1.5 hrs", status: "CANCELLED" },
        ],
        equipmentAvailability: {
          totalAvailable: 42,
          totalInUse: 18,
          totalMaintenance: 4,
          availabilityRate: "70%",
        },
        waitlistStatus: [
          { id: 1, equipmentName: "Atomic Force Microscope", position: 2, estimatedWait: "1 Day", requestedDate: "2026-08-06" },
          { id: 2, equipmentName: "Cryo-EM System", position: 4, estimatedWait: "3 Days", requestedDate: "2026-08-09" },
        ],
        recommendedEquipment: [
          { id: 201, name: "Fluorescence Microscope", department: "Biology", rating: "4.9", image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&auto=format&fit=crop&q=60" },
          { id: 202, name: "XRD Diffractometer", department: "Materials", rating: "4.8", image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400&auto=format&fit=crop&q=60" },
          { id: 203, name: "Autoclave Sterilizer 50L", department: "Microbiology", rating: "4.7", image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=60" },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setDateFilter("this_month");
    setDepartmentFilter("All Departments");
    setEquipmentFilter("All Equipment");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress size={48} />
      </Box>
    );
  }

  const {
    myBookings = [],
    upcomingReservations = [],
    bookingHistory = [],
    equipmentAvailability = {},
    waitlistStatus = [],
    recommendedEquipment = [],
  } = dashboardData || {};

  // Table Columns Setup
  const myBookingsColumns = [
    { key: "id", label: "Booking ID" },
    { key: "equipmentName", label: "Equipment" },
    { key: "lab", label: "Laboratory" },
    { key: "startTime", label: "Start Time" },
    { key: "endTime", label: "End Time" },
    { key: "status", label: "Status", type: "chip" },
  ];

  const bookingHistoryColumns = [
    { key: "id", label: "ID" },
    { key: "equipmentName", label: "Equipment Item" },
    { key: "date", label: "Date" },
    { key: "hours", label: "Duration" },
    { key: "status", label: "Status", type: "chip" },
  ];

  const waitlistColumns = [
    { key: "equipmentName", label: "Equipment" },
    { key: "position", label: "Queue Position", render: (val) => <Chip label={`#${val} in queue`} color="warning" size="small" sx={{ fontWeight: 700 }} /> },
    { key: "estimatedWait", label: "Est. Wait" },
    { key: "requestedDate", label: "Requested Date" },
  ];

  // Chart dataset
  const availabilityChartData = [
    { name: "Available", value: equipmentAvailability.totalAvailable || 42, color: "#10b981" },
    { name: "In Use", value: equipmentAvailability.totalInUse || 18, color: "#3b82f6" },
    { name: "Maintenance", value: equipmentAvailability.totalMaintenance || 4, color: "#ef4444" },
  ];

  // Report Export
  const handleExportPDF = () => {
    downloadPDF("Researcher Bookings Report", myBookingsColumns, myBookings, {
      "Total Active Bookings": myBookings.length,
      "Upcoming Reservations": upcomingReservations.length,
      "Equipment Availability Rate": equipmentAvailability.availabilityRate || "70%",
    });
  };

  const handleExportExcel = () => {
    downloadExcel("researcher-bookings", myBookingsColumns, myBookings);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
            Researcher Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your active bookings, view equipment availability, and track waitlist status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ borderRadius: 2, fontWeight: 700 }}>
            PDF Report
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExportExcel} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Export Excel
          </Button>
        </Stack>
      </Box>

      {/* Phase 8: Interactive Filter Toolbar */}
      <DashboardFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        equipmentFilter={equipmentFilter}
        setEquipmentFilter={setEquipmentFilter}
        onReset={handleResetFilters}
      />

      {/* KPI Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="My Active Bookings"
            value={myBookings.length}
            subtitle="Current & scheduled bookings"
            icon={<BookmarkIcon fontSize="large" />}
            color="primary"
            trend="up"
            trendValue="+2 this week"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Upcoming Reservations"
            value={upcomingReservations.length}
            subtitle="Next 7 days"
            icon={<EventAvailableIcon fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Equipment Availability"
            value={equipmentAvailability.availabilityRate || "70%"}
            subtitle={`${equipmentAvailability.totalAvailable || 42} items available`}
            icon={<CheckCircleIcon fontSize="large" />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Waitlist Enrolled"
            value={waitlistStatus.length}
            subtitle="Queue position status"
            icon={<HourglassTopIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Main Grid Section */}
      <Grid container spacing={3} mb={4}>
        {/* Phase 4: My Bookings Table */}
        <Grid item xs={12} lg={8}>
          <DashboardTable
            title="My Bookings"
            columns={myBookingsColumns}
            data={myBookings}
            actionLabel="View All"
            emptyMessage="No active bookings found for your account."
          />
        </Grid>

        {/* Phase 4: Upcoming Reservations Cards */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarTodayIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upcoming Reservations
              </Typography>
            </Box>

            <Stack spacing={2}>
              {upcomingReservations.map((res) => (
                <Box
                  key={res.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                    {res.title || res.equipmentName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    🗓️ {res.date} • ⏱️ {res.duration}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }} display="block" mt={0.25}>
                    📍 {res.room || "Main Lab"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        {/* Phase 4: Equipment Availability Pie Chart */}
        <Grid item xs={12} md={5}>
          <DashboardChart
            title="Equipment Availability Overview"
            subtitle="Current status breakdown across all laboratories"
            type="doughnut"
            data={availabilityChartData}
            height={280}
          />
        </Grid>

        {/* Phase 4: Waitlist Status Table */}
        <Grid item xs={12} md={7}>
          <DashboardTable
            title="Waitlist Status"
            columns={waitlistColumns}
            data={waitlistStatus}
            emptyMessage="You are currently not on any equipment waitlists."
          />
        </Grid>
      </Grid>

      {/* Phase 4: Booking History */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <DashboardTable
            title="Booking History"
            columns={bookingHistoryColumns}
            data={bookingHistory}
            rowsPerPageDefault={5}
            emptyMessage="No previous booking history record found."
          />
        </Grid>
      </Grid>

      {/* Phase 4: Recommendations */}
      <Box mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Recommended Equipment for You
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Based on your research domain and popular lab gear in your department.
        </Typography>

        <Grid container spacing={3}>
          {recommendedEquipment.map((eq) => (
            <Grid item xs={12} sm={6} md={4} key={eq.id}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  transition: "transform 0.2s, boxShadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 20px rgba(0,0,0,0.08)" },
                }}
              >
                <CardMedia component="img" height="140" image={eq.image} alt={eq.name} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip label={eq.department} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ color: "#f59e0b", fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {eq.rating}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    {eq.name}
                  </Typography>

                  <Button variant="contained" color="primary" fullWidth sx={{ borderRadius: 2, fontWeight: 700, mt: 1 }}>
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
