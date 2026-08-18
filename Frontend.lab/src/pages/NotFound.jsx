import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function NotFound() {
  return (
    <Container>
      <Box
        sx={{
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 4,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#e2e8f0",
            borderRadius: "50%",
            width: 120,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 4,
          }}
        >
          <SearchIcon sx={{ fontSize: 60, color: "#475569" }} />
        </Box>
        
        <Typography variant="h1" sx={{ fontWeight: 900, color: "#0f172a", fontSize: { xs: "5rem", md: "8rem" }, lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mt: 2, mb: 1 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
          Oops! The page you are looking for doesn't exist, was removed, or is temporarily unavailable.
        </Typography>

        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "#0284c7",
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: "none",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#0369a1",
              boxShadow: "none",
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
}
