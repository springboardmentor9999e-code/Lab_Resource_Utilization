import React from "react";
import { Grid, Card, CardContent, Typography, Box, Chip } from "@mui/material";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EngineeringIcon from "@mui/icons-material/Engineering";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function CostSummaryCards({ data = {} }) {
  const totalCost = data.totalCost ?? 485200;
  const maintenanceCost = data.maintenanceCost ?? 142000;
  const calibrationCost = data.calibrationCost ?? 88500;
  const billingCost = data.billingCost ?? 64700;

  const cardItems = [
    {
      title: "TOTAL COST ALLOCATED",
      value: `₹${totalCost.toLocaleString("en-IN")}`,
      trend: "+12.4% vs last month",
      icon: <AttachMoneyIcon sx={{ fontSize: 28, color: "#ffffff" }} />,
      bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      borderAccent: "#2563eb",
    },
    {
      title: "MAINTENANCE CONTRIBUTION",
      value: `₹${maintenanceCost.toLocaleString("en-IN")}`,
      trend: "29.2% of total budget",
      icon: <EngineeringIcon sx={{ fontSize: 28, color: "#ffffff" }} />,
      bgGradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
      borderAccent: "#059669",
    },
    {
      title: "CALIBRATION & REPAIRS",
      value: `₹${calibrationCost.toLocaleString("en-IN")}`,
      trend: "Scheduled for Q3",
      icon: <BuildCircleIcon sx={{ fontSize: 28, color: "#ffffff" }} />,
      bgGradient: "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)",
      borderAccent: "#d97706",
    },
    {
      title: "OUTSTANDING INVOICES",
      value: `₹${billingCost.toLocaleString("en-IN")}`,
      trend: "5 pending collections",
      icon: <ReceiptLongIcon sx={{ fontSize: 28, color: "#ffffff" }} />,
      bgGradient: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
      borderAccent: "#dc2626",
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {cardItems.map((item, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.2)",
              },
              background: item.bgGradient,
              color: "#ffffff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "0.7rem",
                  }}
                >
                  {item.title}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "12px",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -0.5 }}>
                {item.value}
              </Typography>

              <Box display="flex" alignItems="center" gap={0.5}>
                <TrendingUpIcon sx={{ fontSize: 16, color: "rgba(255, 255, 255, 0.9)" }} />
                <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 600 }}>
                  {item.trend}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
