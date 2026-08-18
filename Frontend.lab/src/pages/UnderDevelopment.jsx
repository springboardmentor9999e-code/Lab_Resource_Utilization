import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function UnderDevelopment() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 6,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: 550,
            width: "100%",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Box
            sx={{
              backgroundColor: "#fef3c7",
              borderRadius: "50%",
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 52, color: "#d97706" }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 850, color: "#0f172a", mb: 1 }}>
            This feature is under development
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Our engineering team is actively working on this module. Check back soon for full access and updates.
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                fontWeight: 700,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Go Back
            </Button>

            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              sx={{
                backgroundColor: "#1e3a8a",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 2,
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#172554",
                  boxShadow: "none",
                },
              }}
            >
              Return to Dashboard
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
