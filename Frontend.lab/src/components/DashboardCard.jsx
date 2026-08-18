import React from "react";
import { Card, CardContent, Typography, Box, Avatar, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function DashboardCard({ title, value, icon, color = "primary", subtitle, trend, trendValue }) {
  const getGradient = (col) => {
    switch (col) {
      case "primary":
        return "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)";
      case "secondary":
        return "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
      case "success":
        return "linear-gradient(135deg, #059669 0%, #10b981 100%)";
      case "warning":
        return "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)";
      case "error":
        return "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)";
      case "info":
        return "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)";
      default:
        return "linear-gradient(135deg, #334155 0%, #475569 100%)";
    }
  };

  return (
    <Card
      sx={{
        background: getGradient(color),
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
        minHeight: 120,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: 3,
        boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.12)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 25px -4px rgba(0, 0, 0, 0.22)",
        },
      }}
    >
      <CardContent sx={{ width: "100%", py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: 1.2, opacity: 0.85, fontWeight: 700, fontSize: "0.75rem" }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5, letterSpacing: "-0.02em" }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                <Chip
                  size="small"
                  icon={trend === "up" ? <TrendingUpIcon style={{ color: "#fff" }} /> : <TrendingDownIcon style={{ color: "#fff" }} />}
                  label={trendValue}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    fontWeight: 700,
                    height: 22,
                    fontSize: "0.7rem",
                  }}
                />
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                width: 52,
                height: 52,
                backdropFilter: "blur(4px)",
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
