import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
  Button,
  Divider
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  Cell
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { getUtilization } from "../../services/dashboardService";

// Fallback Mock Datasets as specified in instructions
const MOCK_DATA = {
  available: 9,
  reserved: 0,
  inUse: 0,
  maintenance: 0,
  labs: [
    { labName: "Programming Lab", utilization: 80 },
    { labName: "AI Lab", utilization: 50 },
    { labName: "Computer Programming Lab", utilization: 0 },
    { labName: "AI & Machine Learning Lab", utilization: 55 },
    { labName: "Networking Lab", utilization: 80 }
  ]
};

export default function UtilizationDashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(MOCK_DATA);

  const isDark = theme.palette.mode === "dark";

  const fetchUtilizationData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await getUtilization();
      if (response && response.data) {
        const responseData = response.data;
        const labs = responseData.labs || (Array.isArray(responseData) ? responseData : []);
        
        setData({
          available: responseData.available ?? responseData.availableEquipment ?? 9,
          reserved: responseData.reserved ?? responseData.reservedEquipment ?? 0,
          inUse: responseData.inUse ?? responseData.inUseEquipment ?? responseData.bookedEquipment ?? 0,
          maintenance: responseData.maintenance ?? responseData.maintenanceEquipment ?? responseData.underMaintenanceEquipment ?? 0,
          labs: labs.length > 0 ? labs : MOCK_DATA.labs
        });
      }
    } catch (err) {
      console.warn("Utilization API offline or unreachable. Displaying fallback mock data.");
      setErrorMsg("Unable to fetch live metrics from API. Showing simulated fallback data.");
      // Keep default mockup values
      setData(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilizationData();
  }, []);

  // Helper to determine heatmap emoji based on percentage
  const getHeatmapEmoji = (pct) => {
    if (pct <= 39) return "🟩";
    if (pct <= 69) return "🟨";
    return "🟥";
  };

  const getHeatmapColorName = (pct) => {
    if (pct <= 39) return "Green";
    if (pct <= 69) return "Yellow";
    return "Red";
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column" gap={2}>
        <CircularProgress color="primary" />
        <Typography variant="body2" color="text.secondary">
          Fetching resource utilization statistics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out", p: 1 }}>
      {/* Page Header */}
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
            Resource Utilization Hub
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Telemetry, reservation percentages, summary metrics, and lab capacity heatmap.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchUtilizationData}
          sx={{ borderRadius: 2, textTransform: "none", px: 2.5 }}
        >
          Refresh Data
        </Button>
      </Box>

      {errorMsg && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Available
                </Typography>
                <Typography variant="h4" fontWeight={850} sx={{ color: theme.palette.success.main }}>
                  {data.available}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Reserved
                </Typography>
                <Typography variant="h4" fontWeight={850} sx={{ color: theme.palette.warning.main }}>
                  {data.reserved}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  In Use
                </Typography>
                <Typography variant="h4" fontWeight={850} sx={{ color: theme.palette.info.main }}>
                  {data.inUse}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3 }}>
            <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                  Maintenance
                </Typography>
                <Typography variant="h4" fontWeight={850} sx={{ color: theme.palette.error.main }}>
                  {data.maintenance}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Heatmap Section */}
      <Grid container spacing={3}>
        {/* Utilization Bar Chart */}
        <Grid item xs={12} md={7}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 2 }}>
                Laboratory Utilization Percentages
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box height={320}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.labs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#e2e8f0"} />
                    <XAxis dataKey="labName" stroke={theme.palette.text.secondary} fontSize={12} />
                    <YAxis stroke={theme.palette.text.secondary} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: theme.palette.divider }} 
                      formatter={(val) => [`${val}%`, 'Utilization']}
                    />
                    <Legend />
                    <Bar name="Utilization Rate" dataKey="utilization" radius={[4, 4, 0, 0]}>
                      {data.labs.map((entry, index) => {
                        // Color color mapping matching heatmap colors roughly
                        let barColor = "#10b981"; // green
                        if (entry.utilization >= 70) {
                          barColor = "#ef4444"; // red
                        } else if (entry.utilization >= 40) {
                          barColor = "#f59e0b"; // yellow/orange
                        }
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Heatmap Section */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: theme.palette.divider, borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={750} sx={{ mb: 1 }}>
                Utilization Heatmap Indicators
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Critical status mapping: 0–39% 🟩 | 40–69% 🟨 | 70–100% 🟥
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <TableContainer component={Paper} elevation={0} sx={{ border: "none", backgroundColor: "transparent" }}>
                <Table size="small">
                  <TableBody>
                    {data.labs.map((lab, index) => {
                      const pct = lab.utilization;
                      const emoji = getHeatmapEmoji(pct);
                      const colorName = getHeatmapColorName(pct);
                      
                      return (
                        <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                          <TableCell sx={{ pl: 0, py: 1.5, fontWeight: 600, fontSize: "0.95rem" }}>
                            {lab.labName}
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 0, py: 1.5 }}>
                            <Box display="inline-flex" alignItems="center" gap={1}>
                              <Typography variant="h6" component="span" sx={{ lineHeight: 1 }}>
                                {emoji}
                              </Typography>
                              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 40, textAlign: "right" }}>
                                {pct}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
