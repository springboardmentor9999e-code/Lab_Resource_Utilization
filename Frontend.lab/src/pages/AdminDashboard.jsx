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
  Paper,
  Divider,
} from "@mui/material";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import DashboardCard from "../components/DashboardCard";
import DashboardStat from "../components/DashboardStat";
import DashboardTable from "../components/DashboardTable";
import DashboardChart from "../components/DashboardChart";
import ReportCard from "../components/ReportCard";
import DashboardFilter from "../components/DashboardFilter";
import dashboardService from "../services/dashboardService";
import { downloadPDF, downloadExcel } from "../utils/exportUtils";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

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
      const data = await dashboardService.getAdminDashboard();
      setAdminData(data);
    } catch (err) {
      console.warn("API call failed, rendering fallback admin dataset:", err);
      setAdminData({
        organizationUtilization: {
          totalLabs: 14,
          totalEquipment: 240,
          avgUtilization: "76.8%",
          assetValue: "$4,850,000",
        },
        departmentSharing: [
          { name: "Chemistry", value: 34, color: "#3b82f6" },
          { name: "Physics", value: 28, color: "#10b981" },
          { name: "Biology", value: 22, color: "#f59e0b" },
          { name: "Bioengineering", value: 16, color: "#8b5cf6" },
        ],
        procurementRecommendation: [
          { id: 1, equipment: "Secondary NMR Spectrometer", priority: "HIGH", reason: "Waitlist > 14 days; 95% utilization rate", estimatedCost: "$180,000", projectedROI: "18.4%" },
          { id: 2, equipment: "Automated Liquid Handler", priority: "MEDIUM", reason: "High demand in Bio-Engineering", estimatedCost: "$45,000", projectedROI: "14.2%" },
          { id: 3, equipment: "High-Performance Centrifuge", priority: "MEDIUM", reason: "Current model near end-of-life", estimatedCost: "$28,000", projectedROI: "12.0%" },
        ],
        roiMetrics: {
          currentQuarterROI: "22.5%",
          annualSavings: "$142,500",
          trend: [
            { name: "Q1 2025", roi: 14.2, savings: 28000 },
            { name: "Q2 2025", roi: 16.8, savings: 34000 },
            { name: "Q3 2025", roi: 19.5, savings: 39000 },
            { name: "Q4 2025", roi: 21.0, savings: 41000 },
            { name: "Q1 2026", roi: 22.5, savings: 45000 },
          ],
        },
        userManagement: {
          totalUsers: 485,
          researchers: 360,
          technicians: 42,
          managers: 18,
          admins: 5,
          recentUsers: [
            { name: "Dr. Elena Rostova", email: "elena@lab.edu", role: "Researcher", department: "Chemistry", status: "ACTIVE" },
            { name: "Marcus Vance", email: "marcus@lab.edu", role: "Lab Manager", department: "Physics", status: "ACTIVE" },
            { name: "Sarah Connor", email: "sarah@lab.edu", role: "Technician", department: "Biology", status: "ACTIVE" },
            { name: "David Kim", email: "david@lab.edu", role: "Researcher", department: "Bioengineering", status: "PENDING" },
          ],
        },
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
    organizationUtilization = {},
    departmentSharing = [],
    procurementRecommendation = [],
    roiMetrics = {},
    userManagement = {},
  } = adminData || {};

  // Table Columns
  const procurementColumns = [
    { key: "equipment", label: "Recommended Asset" },
    { key: "priority", label: "Priority", type: "chip" },
    { key: "reason", label: "Justification & Demand" },
    { key: "estimatedCost", label: "Est. Cost" },
    { key: "projectedROI", label: "Projected ROI" },
  ];

  const userColumns = [
    { key: "name", label: "User Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department" },
    { key: "status", label: "Status", type: "chip" },
  ];

  const handleExportPDF = () => {
    downloadPDF("Institution Admin Executive Summary", procurementColumns, procurementRecommendation, {
      "Total Active Users": userManagement.totalUsers || 485,
      "Asset Value": organizationUtilization.assetValue || "$4.85M",
      "Average Utilization": organizationUtilization.avgUtilization || "76.8%",
      "Current ROI": roiMetrics.currentQuarterROI || "22.5%",
    });
  };

  const handleExportExcel = () => {
    downloadExcel("procurement-recommendations", procurementColumns, procurementRecommendation);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Bar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.02em" }}>
            Admin Executive Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Strategic organization statistics, department sharing, cost analysis, ROI metrics, user management & reports.
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

      {/* Phase 6: Organization Statistics KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Lab Facilities"
            value={organizationUtilization.totalLabs || 14}
            subtitle={`${organizationUtilization.totalEquipment || 240} total equipment assets`}
            icon={<CorporateFareIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Avg Lab Utilization"
            value={organizationUtilization.avgUtilization || "76.8%"}
            subtitle="Optimal benchmark > 70%"
            icon={<AccountBalanceIcon fontSize="large" />}
            color="success"
            trend="up"
            trendValue="+3.1% YoY"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Current Quarter ROI"
            value={roiMetrics.currentQuarterROI || "22.5%"}
            subtitle={`Annual savings: ${roiMetrics.annualSavings || "$142.5K"}`}
            icon={<TrendingUpIcon fontSize="large" />}
            color="info"
            trend="up"
            trendValue="+1.5% quarter"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Active System Users"
            value={userManagement.totalUsers || 485}
            subtitle={`${userManagement.researchers || 360} registered researchers`}
            icon={<GroupIcon fontSize="large" />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Phase 6: ROI Line Chart & Department Sharing Pie Chart */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={7}>
          <DashboardChart
            title="Return on Investment (ROI) & Cost Savings"
            subtitle="Quarterly ROI percentage and financial savings trend"
            type="line"
            data={roiMetrics.trend || []}
            xKey="name"
            dataKeys={[
              { key: "roi", label: "ROI (%)", color: "#10b981" },
              { key: "savings", label: "Savings ($)", color: "#3b82f6" },
            ]}
            height={320}
          />
        </Grid>

        <Grid item xs={12} lg={5}>
          <DashboardChart
            title="Department Sharing Distribution"
            subtitle="Cross-department equipment sharing share by department"
            type="doughnut"
            data={departmentSharing}
            xKey="name"
            dataKeys={[{ key: "value", label: "Sharing Sessions" }]}
            height={320}
          />
        </Grid>
      </Grid>

      {/* Phase 6: Cost Analysis & Procurement Recommendations */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <DashboardTable
            title="Procurement Recommendations & Cost Analysis"
            columns={procurementColumns}
            data={procurementRecommendation}
            emptyMessage="No procurement recommendations currently generated."
          />
        </Grid>
      </Grid>

      {/* Phase 6: User Management Overview */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <DashboardTable
            title="Recent User Registrations & Status"
            columns={userColumns}
            data={userManagement.recentUsers || []}
            emptyMessage="No recent users recorded."
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              User Role Distribution
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
              Breakdown of system accounts by security role
            </Typography>

            <Stack spacing={2}>
              {[
                { label: "Researchers / Students", count: userManagement.researchers || 360, color: "#3b82f6" },
                { label: "Lab Technicians", count: userManagement.technicians || 42, color: "#10b981" },
                { label: "Lab Managers", count: userManagement.managers || 18, color: "#f59e0b" },
                { label: "Administrators", count: userManagement.admins || 5, color: "#8b5cf6" },
              ].map((role) => (
                <Box key={role.label} display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: "action.hover", borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: role.color }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {role.label}
                    </Typography>
                  </Box>
                  <Chip label={role.count} size="small" sx={{ fontWeight: 800 }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Phase 6 & Phase 9: System Reports Exporters */}
      <Box mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          System & Executive Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Instant export tools for PDF and Excel analysis documents.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ReportCard
              title="Organization Utilization Report"
              description="Complete audit of equipment hours, active labs, and maintenance records."
              badge="Executive"
              metrics={{
                "Total Assets": organizationUtilization.totalEquipment || 240,
                "Avg Utilization": organizationUtilization.avgUtilization || "76.8%",
                "Total Value": organizationUtilization.assetValue || "$4.85M",
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ReportCard
              title="ROI & Procurement Financial Analysis"
              description="Financial breakdown of asset purchases, maintenance costs, and cost recovery."
              badge="Financial"
              metrics={{
                "Quarterly ROI": roiMetrics.currentQuarterROI || "22.5%",
                "Annual Savings": roiMetrics.annualSavings || "$142.5K",
                "Items Pending": procurementRecommendation.length,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
