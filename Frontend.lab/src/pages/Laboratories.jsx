import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import api from "../services/api";

export default function Laboratories() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLaboratories();
  }, []);

  const fetchLaboratories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/laboratories");
      console.log("Laboratories response:", response.data);
      setLabs(response.data || []);
    } catch (err) {
      console.error("Failed to fetch laboratories:", err);
      setError("Failed to load laboratories. Please try again.");
      setLabs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "maintenance":
        return "warning";
      case "closed":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e3a8a", mb: 1 }}>
          Laboratories
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage all available laboratory facilities.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {labs.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No laboratories found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {labs.map((lab) => (
            <Grid item xs={12} sm={6} md={4} key={lab.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s, boxShadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                  },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  title={lab.labName || "Unnamed Lab"}
                  titleTypographyProps={{ variant: "h6", sx: { fontWeight: 700 } }}
                  action={
                    <Chip
                      label={lab.status || "Unknown"}
                      color={getStatusColor(lab.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2} gap={1}>
                    <LocationOnIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    <Typography variant="body2" color="text.secondary">
                      {lab.location || "Location not specified"}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2, color: "#0f172a", lineHeight: 1.5 }}>
                    {lab.description || "No description available"}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon sx={{ fontSize: 18, color: "#64748b" }} />
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {lab.capacity || "N/A"} persons
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}