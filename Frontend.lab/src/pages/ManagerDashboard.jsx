import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import BuildIcon from "@mui/icons-material/Build";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";

import DashboardCard from "../components/DashboardCard";
import DashboardStat from "../components/DashboardStat";
import DashboardTable from "../components/DashboardTable";
import DashboardChart from "../components/DashboardChart";
import HeatMap from "../components/HeatMap";
import DashboardFilter from "../components/DashboardFilter";
import dashboardService from "../services/dashboardService";
import { downloadPDF, downloadExcel } from "../utils/exportUtils";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [managerData, setManagerData] = useState(null);

  // Filters state
  const [dateFilter, setDateFilter] = useState("this_month");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [equipmentFilter, setEquipmentFilter] = useState("All Equipment");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getManagerDashboard();
      setManagerData(data);
    } catch (err) {
      console.warn("API call failed, falling back to manager dataset:", err);
      setManagerData({
        noShowRate: 4.8, // 4.8%
        bookingAdoption: {
          rate: "88.4%",
          totalBookingsThisMonth: 342,
          trend: [
            { name: "Week 1", adoption: 72, bookings: 78 },
            { name: "Week 2", adoption: 80, bookings: 85 },
            { name: "Week 3", adoption: 86, bookings: 92 },
            { name: "Week 4", adoption: 91, bookings: 87 },
          ],
        },
        maintenanceOverview: {
          totalScheduled: 6,
          inProgress: 2,
          upcoming: [
            { id: 1, equipment: "Zeiss Electron Microscope", lab: "Physics Suite A", date: "2026-08-10", technician: "John Doe", type: "Preventive" },
            { id: 2, equipment: "NMR Spectrometer 400MHz", lab: "Chemistry Lab 3", date: "2026-08-12", technician: "Sarah Connor", type: "Calibration" },
            { id: 3, equipment: "High-Speed Centrifuge B7", lab: "Bio-Lab 2", date: "2026-08-15", technician: "Alex Smith", type: "Repair" },
          ],
        },
        highDemandEquipment: [
          { id: 1, name: "Zeiss Electron Microscope", department: "Physics", utilization: "94%", totalHours: 188, requests: 45 },
          { id: 2, name: "NMR Spectrometer 400MHz", department: "Chemistry", utilization: "88%", totalHours: 176, requests: 39 },
          { id: 3, name: "Mass Spectrometer X2", department: "Bio-Chem", utilization: "82%", totalHours: 164, requests: 31 },
          { id: 4, name: "XRD Diffractometer", department: "Materials", utilization: "78%", totalHours: 156, requests: 28 },
        ],
        sharingRequests: [
          { id: 501, equipment: "Confocal Laser Microscope", requestingLab: "Bio-Engineering Lab", ownerLab: "Cellular Biology Lab", requestedDates: "Aug 12 - Aug 14", status: "PENDING" },
          { id: 502, equipment: "Thermal Imaging Camera", requestingLab: "Physics Thermal Lab", ownerLab: "Mechanical Eng Lab", requestedDates: "Aug 15 - Aug 16", status: "APPROVED" },
          { id: 503, equipment: "Gas Chromatography Mass Spec", requestingLab: "Environmental Sci Lab", ownerLab: "Chemistry Research Lab", requestedDates: "Aug 18 - Aug 20", status: "PENDING" },
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
    noShowRate = 4.8,
    bookingAdoption = {},
    maintenanceOverview = {},
    highDemandEquipment = [],
    sharingRequests = [],
  } = managerData || {};

  // Table Columns
  const highDemandColumns = [
    { key: "name", label: "Equipment Name" },
    { key: "department", label: "Department" },
    { key: "utilization", label: "Utilization Rate" },
    { key: "totalHours", label: "Hours Booked" },
    { key: "requests", label: "Total Requests" },
  ];

  const maintenanceColumns = [
    { key: "equipment", label: "Equipment" },
    { key: "lab", label: "Lab Location" },
    { key: "date", label: "Scheduled Date" },
    { key: "technician", label: "Technician" },
    { key: "type", label: "Type", type: "chip" },
  ];

  const sharingColumns = [
    { key: "equipment", label: "Resource / Equipment" },
    { key: "requestingLab", label: "Requesting Lab" },
    { key: "ownerLab", label: "Owner Lab" },
    { key: "requestedDates", label: "Requested Period" },
    { key: "status", label: "Status", type: "chip" },
    {
      key: "actions",
      label: "Decision Actions",
      align: "center",
      render: (_, row) =>
        row.status === "PENDING" ? (
          <Stack direction="row" spacing={1} justifyContent="center">
            <MuiTooltip title="Approve Request">
              <IconButton size="small" color="success">
                <CheckCircleOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
            <MuiTooltip title="Reject Request">
              <IconButton size="small" color="error">
                <CancelOutlinedIcon fontSize="small" />
              </IconButton>
            </MuiTooltip>
          </Stack>
        ) : (
          <Chip label="Processed" size="small" variant="outlined" />
        ),
    },
  ];

  // Report Export logic
  const handleExportPDF = () => {
    downloadPDF("Manager Operational Dashboard Report", highDemandColumns, highDemandEquipment, {
      "No-Show Rate": `${noShowRate}%`,
      "Booking Adoption": bookingAdoption.rate || "88.4%",
      "Scheduled Maintenance": maintenanceOverview.totalScheduled || 6,
    });
  };

  const handleExportExcel = () => {
    downloadExcel("manager-high-demand-equipment", highDemandColumns, highDemandEquipment);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
            Manager Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor lab utilization heatmap, booking adoption rates, equipment maintenance, and inter-lab sharing.
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

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Booking Adoption Rate"
            value={bookingAdoption.rate || "88.4%"}
            subtitle={`${bookingAdoption.totalBookingsThisMonth || 342} total bookings`}
            icon={<ShowChartIcon fontSize="large" />}
            color="primary"
            trend="up"
            trendValue="+4.2% vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="No-Show Rate"
            value={`${noShowRate}%`}
            subtitle="Target threshold < 5%"
            icon={<PersonOffIcon fontSize="large" />}
            color={noShowRate > 5 ? "error" : "success"}
            trend="down"
            trendValue="-1.1% decrease"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Maintenance Schedule"
            value={maintenanceOverview.totalScheduled || 6}
            subtitle={`${maintenanceOverview.inProgress || 2} currently in progress`}
            icon={<BuildIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Sharing Requests"
            value={sharingRequests.length}
            subtitle="Inter-lab equipment sharing"
            icon={<ShareIcon fontSize="large" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Phase 5: Utilization Heatmap & Adoption Trend */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={7}>
          <HeatMap title="Utilization Heatmap" subtitle="Peak hourly lab resource demand across weekdays" />
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardChart
            title="Booking Adoption Trend"
            subtitle="Weekly adoption percentage over current month"
            type="line"
            data={bookingAdoption.trend || []}
            xKey="name"
            dataKeys={[
              { key: "adoption", label: "Adoption Rate (%)", color: "#3b82f6" },
              { key: "bookings", label: "Total Bookings", color: "#10b981" },
            ]}
            height={330}
          />
        </Grid>
      </Grid>

      {/* Phase 5: High Demand Equipment & Maintenance Schedule */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={6}>
          <DashboardTable
            title="High-Demand Equipment"
            columns={highDemandColumns}
            data={highDemandEquipment}
            actionLabel="View All"
            emptyMessage="No high demand equipment items recorded."
          />
        </Grid>

        <Grid item xs={12} lg={6}>
          <DashboardTable
            title="Maintenance Schedule"
            columns={maintenanceColumns}
            data={maintenanceOverview.upcoming || []}
            emptyMessage="No scheduled maintenance events found."
          />
        </Grid>
      </Grid>

      {/* Phase 5: Inter-Lab Sharing Requests */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <DashboardTable
            title="Inter-Departmental Resource Sharing Requests"
            columns={sharingColumns}
            data={sharingRequests}
            emptyMessage="No pending resource sharing requests."
          />
        </Grid>
      </Grid>
    </Container>
  );
}
