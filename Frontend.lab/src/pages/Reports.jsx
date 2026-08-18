import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Divider,
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
  useTheme,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import GridOnIcon from "@mui/icons-material/GridOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import ScienceIcon from "@mui/icons-material/Science";
import EventNoteIcon from "@mui/icons-material/EventNote";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EngineeringIcon from "@mui/icons-material/Engineering";
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
  Filler,
} from "chart.js";
import api from "../services/api";

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
  LineElement,
  Filler
);

export default function Reports() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [inventoryList, setInventoryList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);

  const [stats, setStats] = useState({
    totalEquipment: 0,
    totalBookings: 0,
    utilizationRate: 0,
    underMaintenance: 0,
  });

  const [chartsData, setChartsData] = useState({
    bar: null,
    pie: null,
    line: null,
  });

  const loadReportsData = async () => {
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
        const raw = equipResp.value?.data;
        if (Array.isArray(raw)) equip = raw;
        else if (raw && Array.isArray(raw.data)) equip = raw.data;
        else if (raw && Array.isArray(raw.content)) equip = raw.content;
        else equip = MOCK_EQUIPMENT;
      } else {
        equip = MOCK_EQUIPMENT;
      }

      if (bookingsResp.status === "fulfilled") {
        const raw = bookingsResp.value?.data;
        if (Array.isArray(raw)) bookings = raw;
        else if (raw && Array.isArray(raw.data)) bookings = raw.data;
        else if (raw && Array.isArray(raw.content)) bookings = raw.content;
        else bookings = MOCK_BOOKINGS;
      } else {
        bookings = MOCK_BOOKINGS;
      }

      const safeEquip = Array.isArray(equip) ? equip : [];
      const safeBookings = Array.isArray(bookings) ? bookings : [];

      setInventoryList(safeEquip);
      setBookingsList(safeBookings);

      // Calculations
      const totalQty = safeEquip.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);
      const availableQty = safeEquip.reduce((sum, item) => sum + (item?.availableQuantity ?? 0), 0);
      const maintenance = safeEquip.filter(
        (e) =>
          (e?.status || "").toLowerCase() === "maintenance" ||
          (e?.status || "").toLowerCase() === "under maintenance"
      ).reduce((sum, item) => sum + (item?.quantity ?? 1), 0);

      const totalBookings = safeBookings.length;
      const utilization = totalQty > 0 ? Math.round(((totalQty - availableQty) / totalQty) * 100) : 0;

      setStats({
        totalEquipment: totalQty,
        totalBookings: totalBookings,
        utilizationRate: utilization,
        underMaintenance: maintenance,
      });

      // Pie: Status Breakdown
      const pieData = {
        labels: ["Available Stock", "Checked Out Stock", "Under Maintenance"],
        datasets: [
          {
            data: [availableQty, Math.max(0, totalQty - availableQty - maintenance), maintenance],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 1,
          },
        ],
      };

      // Bar: Demand by Equipment Name
      const names = Array.from(
        new Set(safeBookings.map((b) => b?.equipmentName || b?.equipment?.name).filter(Boolean))
      );
      const counts = names.map(
        (name) =>
          safeBookings.filter((b) => (b?.equipmentName || b?.equipment?.name) === name).length
      );

      const barData = {
        labels: names.length > 0 ? names : ["No Reservations"],
        datasets: [
          {
            label: "Reservation Counts",
            data: counts.length > 0 ? counts : [0],
            backgroundColor: isDark ? "#818cf8" : "#1e3a8a",
            borderRadius: 6,
          },
        ],
      };

      // Line: Booking frequency trends over dates
      const dates = Array.from(new Set(safeBookings.map((b) => b?.bookingDate).filter(Boolean))).sort();
      const dailyCounts = dates.map((d) => safeBookings.filter((b) => b?.bookingDate === d).length);

      const lineData = {
        labels: dates.length > 0 ? dates : ["No Booking Data"],
        datasets: [
          {
            label: "Daily Request Frequency",
            data: dailyCounts.length > 0 ? dailyCounts : [0],
            borderColor: "#0ea5e9",
            backgroundColor: "rgba(14, 165, 233, 0.15)",
            fill: true,
            tension: 0.4,
          },
        ],
      };

      setChartsData({
        pie: pieData,
        bar: barData,
        line: lineData,
      });
    } catch (err) {
      console.error("Reports loading error:", err);
      setErrorMsg("Failed to synchronize reporting dataset. Displaying local data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Lab Inventory & Bookings</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; }
          .header { background-color: #1e3a8a; color: white; text-align: center; font-weight: bold; }
          .metric-header { background-color: #f1f5f9; font-weight: bold; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h2>Lab platform - Operational Report</h2>
        <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
        
        <h3>1. Key Performance Indicators</h3>
        <table>
          <tr class="metric-header">
            <td>Total Equipment</td>
            <td>Total Bookings</td>
            <td>Utilization Rate</td>
            <td>Maintenance Assets</td>
          </tr>
          <tr>
            <td>${stats.totalEquipment}</td>
            <td>${stats.totalBookings}</td>
            <td>${stats.utilizationRate}%</td>
            <td>${stats.underMaintenance}</td>
          </tr>
        </table>
        
        <br/>
        <h3>2. Equipment Inventory Status</h3>
        <table>
          <thead>
            <tr class="header">
              <th>Equipment Name</th>
              <th>Category</th>
              <th>Total Stock</th>
              <th>Available Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${inventoryList
              .map(
                (item) => `
              <tr>
                <td>${item?.name || "N/A"}</td>
                <td>${item?.category || "N/A"}</td>
                <td>${item?.quantity ?? 0}</td>
                <td>${item?.availableQuantity ?? 0}</td>
                <td>${item?.status || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <br/>
        <h3>3. Reservation Bookings Log</h3>
        <table>
          <thead>
            <tr class="header">
              <th>Booking ID</th>
              <th>Equipment Name</th>
              <th>Booking Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${bookingsList
              .map(
                (b) => `
              <tr>
                <td>${b?.id || b?._id || "N/A"}</td>
                <td>${b?.equipmentName || b?.equipment?.name || "N/A"}</td>
                <td>${b?.bookingDate || "N/A"}</td>
                <td>${b?.status || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lab_utilization_report_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && inventoryList.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Premium Options for Recharts / ChartJS Elements
  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDark ? "#cbd5e1" : "#475569",
          font: {
            family: "'Outfit', 'Inter', sans-serif",
            weight: 600,
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f8fafc" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#475569",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        titleFont: { family: "'Outfit', 'Inter', sans-serif", weight: 700 },
        bodyFont: { family: "'Outfit', 'Inter', sans-serif" },
      },
    },
  };

  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f8fafc" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#475569",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        titleFont: { family: "'Outfit', 'Inter', sans-serif", weight: 700 },
        bodyFont: { family: "'Outfit', 'Inter', sans-serif" },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "'Outfit', 'Inter', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? "#334155" : "#f1f5f9",
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "'Outfit', 'Inter', sans-serif",
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };

  const lineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        titleColor: isDark ? "#f8fafc" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#475569",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        titleFont: { family: "'Outfit', 'Inter', sans-serif", weight: 700 },
        bodyFont: { family: "'Outfit', 'Inter', sans-serif" },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "'Outfit', 'Inter', sans-serif",
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: isDark ? "#334155" : "#f1f5f9",
        },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: {
            family: "'Outfit', 'Inter', sans-serif",
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }} id="printable-report-area">
      {/* Header section */}
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="start"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        className="no-print"
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isDark ? "#818cf8" : "#1e3a8a" }}>
            Operational Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Consolidated overview of laboratory assets, reservation records, and maintenance logs.
          </Typography>
        </Box>

        <Box display="flex" gap={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadReportsData}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownloadPDF}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: "#ef4444",
              "&:hover": { backgroundColor: "#dc2626" },
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<GridOnIcon />}
            onClick={handleDownloadExcel}
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              backgroundColor: "#10b981",
              "&:hover": { backgroundColor: "#059669" },
            }}
          >
            Download Excel
          </Button>
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} className="no-print">
          {errorMsg}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Equipment */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: "none",
              borderRadius: 4,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDark
                  ? "0 12px 20px -10px rgba(0,0,0,0.5)"
                  : "0 12px 20px -10px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Total Equipment
                </Typography>
                <Typography variant="h4" fontWeight={900} color="text.primary" mt={0.5}>
                  {stats.totalEquipment}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Physical inventory units
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  background: isDark ? "rgba(99, 102, 241, 0.15)" : "#e0e7ff",
                  color: isDark ? "#818cf8" : "#1e3a8a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ScienceIcon sx={{ fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: "none",
              borderRadius: 4,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDark
                  ? "0 12px 20px -10px rgba(0,0,0,0.5)"
                  : "0 12px 20px -10px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Total Bookings
                </Typography>
                <Typography variant="h4" fontWeight={900} color="primary.main" mt={0.5}>
                  {stats.totalBookings}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Reservations processed
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  background: isDark ? "rgba(14, 165, 233, 0.15)" : "#e0f2fe",
                  color: isDark ? "#38bdf8" : "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EventNoteIcon sx={{ fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Utilization % */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: "none",
              borderRadius: 4,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDark
                  ? "0 12px 20px -10px rgba(0,0,0,0.5)"
                  : "0 12px 20px -10px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Utilization %
                </Typography>
                <Typography variant="h4" fontWeight={900} color="success.main" mt={0.5}>
                  {stats.utilizationRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Overall asset usage index
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  background: isDark ? "rgba(16, 185, 129, 0.15)" : "#d1fae5",
                  color: isDark ? "#34d399" : "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: "none",
              borderRadius: 4,
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: isDark
                  ? "0 12px 20px -10px rgba(0,0,0,0.5)"
                  : "0 12px 20px -10px rgba(0,0,0,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Maintenance
                </Typography>
                <Typography variant="h4" fontWeight={900} color="error.main" mt={0.5}>
                  {stats.underMaintenance}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  Assets undergoing service
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "12px",
                  background: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
                  color: isDark ? "#f87171" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EngineeringIcon sx={{ fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Pie: Status Breakdown */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", boxShadow: "none", borderRadius: 4, p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3} align="center">
              Equipment Status Breakdown
            </Typography>
            <Box height={240} display="flex" justifyContent="center">
              {chartsData.pie && <Pie data={chartsData.pie} options={pieOptions} />}
            </Box>
          </Paper>
        </Grid>

        {/* Bar: Resource Demand */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", boxShadow: "none", borderRadius: 4, p: 3, height: "100%" }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3}>
              Resource Allocation Demand
            </Typography>
            <Box height={240}>
              {chartsData.bar && <Bar data={chartsData.bar} options={barOptions} />}
            </Box>
          </Paper>
        </Grid>

        {/* Line: Booking frequency trends */}
        <Grid item xs={12}>
          <Paper sx={{ border: isDark ? "1px solid #334155" : "1px solid #e2e8f0", boxShadow: "none", borderRadius: 4, p: 3 }}>
            <Typography variant="subtitle1" fontWeight={800} mb={3}>
              Reservation Timeline Frequencies
            </Typography>
            <Box height={240}>
              {chartsData.line && <Line data={chartsData.line} options={lineOptions} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Equipment list detail report */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Detailed Inventory Summary
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: isDark ? "#1e293b" : "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Equipment Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Total Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Available Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(inventoryList) && inventoryList.length > 0 ? (
                inventoryList.map((item, index) => {
                  const itemId = item?.id || item?._id || index;
                  const isLow = (item?.availableQuantity ?? 0) <= 2;
                  return (
                    <TableRow key={itemId} sx={{ "&:hover": { backgroundColor: isDark ? "#334155" : "#f8fafc" } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{item?.name || "Equipment"}</TableCell>
                      <TableCell>{item?.category || "General"}</TableCell>
                      <TableCell align="center">{item?.quantity ?? 0}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ color: isLow ? "error.main" : "text.primary", fontWeight: isLow ? 700 : 500 }}
                      >
                        {item?.availableQuantity ?? 0}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item?.status || "Available"}
                          color={
                            (item?.status || "").toLowerCase() === "available"
                              ? "success"
                              : (item?.status || "").toLowerCase() === "maintenance" ||
                                (item?.status || "").toLowerCase() === "under maintenance"
                              ? "error"
                              : "default"
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No equipment records found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Hidden print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print, 
          nav, 
          header, 
          aside,
          footer,
          .MuiDrawer-root,
          .MuiAppBar-root,
          button,
          .MuiButton-root {
            display: none !important;
          }
          body, main, #root {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #printable-report-area {
            animation: none !important;
            padding: 10px !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Ensure charts print nicely */
          canvas {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      ` }} />
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Maintenance" },
  { id: "3", name: "Centrifuge 5000 RPM", category: "Biology", quantity: 5, availableQuantity: 4, status: "Available" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-18", status: "Approved" },
  { id: "102", equipmentName: "UV-Vis Spectrophotometer", bookingDate: "2026-07-19", status: "Approved" },
  { id: "103", equipmentName: "Centrifuge 5000 RPM", bookingDate: "2026-07-20", status: "Confirmed" },
];