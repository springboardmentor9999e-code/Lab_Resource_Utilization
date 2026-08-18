import React from "react";
import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        mt: "auto",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Lab Resource Utilization Platform
      </Typography>
      <Typography variant="caption" color="text.muted" sx={{ fontWeight: 600 }}>
        Version 1.0.0
      </Typography>
    </Box>
  );
}
