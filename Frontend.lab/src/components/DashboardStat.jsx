import React from "react";
import { Paper, Box, Typography, Avatar } from "@mui/material";

export default function DashboardStat({ label, value, subtext, icon, color = "#3b82f6" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
        },
      }}
    >
      {icon && (
        <Avatar
          sx={{
            bgcolor: `${color}15`,
            color: color,
            width: 48,
            height: 48,
            borderRadius: 2,
          }}
        >
          {icon}
        </Avatar>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mt: 0.25 }}>
          {value}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: "0.75rem" }}>
            {subtext}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
