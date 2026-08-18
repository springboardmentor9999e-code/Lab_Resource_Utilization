import React from "react";
import { Paper, Box, Typography, Tooltip, useTheme } from "@mui/material";

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_TIMES = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

export default function HeatMap({
  title = "Resource Utilization Heatmap",
  subtitle = "Hourly lab occupancy & equipment load levels",
  days = DEFAULT_DAYS,
  timeSlots = DEFAULT_TIMES,
  matrix = null,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Generate fallback synthetic heatmap data if none provided
  const generateData = () => {
    if (matrix && matrix.length > 0) return matrix;

    return days.map((day, dIdx) =>
      timeSlots.map((time, tIdx) => {
        // Peak hours around 10am-4pm on weekdays
        const isPeak = dIdx < 5 && tIdx >= 1 && tIdx <= 4;
        const val = isPeak ? Math.floor(65 + Math.random() * 32) : Math.floor(10 + Math.random() * 45);
        return val;
      })
    );
  };

  const dataMatrix = generateData();

  const getColor = (value) => {
    if (value >= 85) return "#ef4444"; // High load (red)
    if (value >= 65) return "#f97316"; // Heavy load (orange)
    if (value >= 45) return "#f59e0b"; // Medium load (amber)
    if (value >= 25) return "#10b981"; // Normal load (green)
    if (value > 0) return "#3b82f6"; // Low load (blue)
    return isDark ? "#334155" : "#e2e8f0"; // Idle
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Legend */}
      <Box display="flex" alignItems="center" gap={1.5} mb={2} flexWrap="wrap">
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", mr: 1 }}>
          Occupancy:
        </Typography>
        {[
          { label: "0-25%", color: "#3b82f6" },
          { label: "25-45%", color: "#10b981" },
          { label: "45-65%", color: "#f59e0b" },
          { label: "65-85%", color: "#f97316" },
          { label: "85-100%", color: "#ef4444" },
        ].map((item) => (
          <Box key={item.label} display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Matrix Table Grid */}
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ minWidth: 480 }}>
          {/* Header row with time slots */}
          <Box display="flex" mb={1}>
            <Box sx={{ width: 60, flexShrink: 0 }} />
            {timeSlots.map((time) => (
              <Box key={time} sx={{ flex: 1, textAlign: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.75rem" }}>
                  {time}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Rows for days */}
          {days.map((day, rowIdx) => (
            <Box key={day} display="flex" alignItems="center" mb={0.8}>
              <Box sx={{ width: 60, flexShrink: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.75rem" }}>
                  {day}
                </Typography>
              </Box>
              {timeSlots.map((time, colIdx) => {
                const value = dataMatrix[rowIdx] ? dataMatrix[rowIdx][colIdx] || 0 : 0;
                const bgColor = getColor(value);

                return (
                  <Box key={`${day}-${time}`} sx={{ flex: 1, px: 0.4 }}>
                    <Tooltip title={`${day} ${time}: ${value}% Utilized`} arrow placement="top">
                      <Box
                        sx={{
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: bgColor,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "transform 0.15s, opacity 0.15s",
                          opacity: 0.9,
                          "&:hover": {
                            transform: "scale(1.08)",
                            opacity: 1,
                            zIndex: 2,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
                          },
                        }}
                      >
                        {value}%
                      </Box>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
