import React from "react";
import { Paper, Box, Typography, Grid, LinearProgress, Chip } from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function MonthlyCostChart({ data = [] }) {
  const defaultMonthlyData = [
    { month: "Jan 2026", cost: 320000, target: 400000 },
    { month: "Feb 2026", cost: 350000, target: 400000 },
    { month: "Mar 2026", cost: 410000, target: 400000 },
    { month: "Apr 2026", cost: 380000, target: 400000 },
    { month: "May 2026", cost: 440000, target: 450000 },
    { month: "Jun 2026", cost: 485200, target: 450000 },
  ];

  const monthlyItems = data.length > 0 ? data : defaultMonthlyData;
  const maxCost = Math.max(...monthlyItems.map((m) => m.cost || 0), 500000);

  return (
    <Paper sx={{ borderRadius: 4, p: 3, boxShadow: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#eff6ff", color: "#2563eb" }}>
            <ShowChartIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e3a8a", lineHeight: 1.2 }}>
              Monthly Expenditure & Cost Recovery Trend
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track multi-month financial allocation trends, equipment utilization costs, and budget thresholds.
            </Typography>
          </Box>
        </Box>
        <Chip icon={<CalendarMonthIcon fontSize="small" />} label="Year 2026 Overview" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
      </Box>

      <Grid container spacing={2}>
        {monthlyItems.map((m, idx) => {
          const costVal = typeof m.cost === "number" ? m.cost : parseFloat(m.cost || 0);
          const fillPercentage = Math.min(Math.round((costVal / maxCost) * 100), 100);

          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {m.month}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#2563eb" }}>
                    ₹{costVal.toLocaleString("en-IN")}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={fillPercentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "#cbd5e1",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: fillPercentage > 90 ? "linear-gradient(90deg, #2563eb 0%, #065f46 100%)" : "#3b82f6",
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    Budget Capacity
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                    {fillPercentage}% Utilized
                  </Typography>
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
