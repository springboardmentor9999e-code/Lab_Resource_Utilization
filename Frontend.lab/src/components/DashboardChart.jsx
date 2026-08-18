import React from "react";
import { Paper, Box, Typography, useTheme } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function DashboardChart({
  title,
  subtitle,
  type = "bar",
  data = [],
  xKey = "name",
  dataKeys = [{ key: "value", label: "Value", color: "#3b82f6" }],
  height = 320,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const tooltipBg = isDark ? "#1e293b" : "#ffffff";

  const renderChartContent = () => {
    if (!data || data.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={height}>
          <Typography variant="body2" color="text.secondary">
            No chart data available
          </Typography>
        </Box>
      );
    }

    if (type === "pie" || type === "doughnut") {
      const pieKey = dataKeys[0]?.key || "value";
      return (
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: gridColor,
                borderRadius: 8,
                color: theme.palette.text.primary,
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 10, color: textColor }} />
            <Pie
              data={data}
              dataKey={pieKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              innerRadius={type === "doughnut" ? 60 : 0}
              outerRadius={95}
              paddingAngle={4}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (type === "line") {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey={xKey} stroke={textColor} fontSize={12} tickLine={false} />
            <YAxis stroke={textColor} fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderColor: gridColor,
                borderRadius: 8,
                color: theme.palette.text.primary,
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 10, color: textColor }} />
            {dataKeys.map((dk, idx) => (
              <Line
                key={dk.key}
                type="monotone"
                dataKey={dk.key}
                name={dk.label || dk.key}
                stroke={dk.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default to Bar Chart
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey={xKey} stroke={textColor} fontSize={12} tickLine={false} />
          <YAxis stroke={textColor} fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: gridColor,
              borderRadius: 8,
              color: theme.palette.text.primary,
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 10, color: textColor }} />
          {dataKeys.map((dk, idx) => (
            <Bar
              key={dk.key}
              dataKey={dk.key}
              name={dk.label || dk.key}
              fill={dk.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
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
      {title && (
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
      )}
      <Box sx={{ flex: 1, minHeight: height }}>{renderChartContent()}</Box>
    </Paper>
  );
}
