import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading({ message = "Loading, please wait..." }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "40vh",
        width: "100%",
        py: 6,
        gap: 2,
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      }}
    >
      <CircularProgress
        size={48}
        thickness={4.5}
        sx={{
          color: "primary.main",
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
          color: "text.secondary",
          letterSpacing: 0.5,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}
