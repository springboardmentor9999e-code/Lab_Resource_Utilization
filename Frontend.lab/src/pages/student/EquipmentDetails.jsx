import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Snackbar from "@mui/material/Snackbar";
import api from "../../services/api";
import JoinWaitlistModal from "../../components/JoinWaitlistModal";

export default function StudentEquipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Waitlist Modal State
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get(`/equipment/${id}`);
      setItem(response.data);
    } catch (err) {
      console.warn("GET /equipment/id failed. Fetching details from mock database.", err);
      const matched = MOCK_EQUIPMENT.find((x) => x.id === id);
      if (matched) {
        setItem(matched);
      } else {
        setErrorMsg("Equipment not found or is currently unavailable.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "booked":
        return "warning";
      case "maintenance":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg || !item) {
    return (
      <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
        <Button
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate("/equipment")}
          sx={{ mb: 3 }}
        >
          Back to Catalog
        </Button>
        <Alert severity="error">{errorMsg || "Failed to fetch equipment details."}</Alert>
      </Box>
    );
  }

  const inStock = (item.availableQuantity ?? 0) > 0;

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Button
        startIcon={<KeyboardBackspaceIcon />}
        onClick={() => navigate("/equipment")}
        sx={{ mb: 3, fontWeight: 700 }}
      >
        Back to Catalog
      </Button>

      <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3, overflow: "hidden" }}>
        <Grid container>
          {/* Left Column: Image Placeholder */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              backgroundColor: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 280,
              color: "#1e3a8a",
            }}
          >
            <ScienceIcon sx={{ fontSize: 90, opacity: 0.6 }} />
          </Grid>

          {/* Right Column: details */}
          <Grid item xs={12} md={7}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {item.name}
                </Typography>
                <Chip
                  label={item.category}
                  size="small"
                  sx={{ fontWeight: 650, backgroundColor: "#f1f5f9" }}
                />
              </Box>

              <Box display="flex" gap={1.5} mb={3.5} alignItems="center">
                <Chip
                  label={item.status}
                  color={getStatusColor(item.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Available Qty: <strong>{item.availableQuantity ?? item.quantity}</strong> / {item.quantity}
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" mb={3.5}>
                {item.description || "No description logged for this device catalog."}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1e3a8a" }}>
                Specifications:
              </Typography>
              
              <List sx={{ p: 0, mb: 4 }}>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary="Access Group / Authorized Department"
                    secondary={item.department || "General Lab Services"}
                    primaryTypographyProps={{ variant: "caption", color: "text.muted" }}
                    secondaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem sx={{ py: 0.5, px: 0 }}>
                  <ListItemText
                    primary="Asset Reference Identifier"
                    secondary={`REF-${item.id || item._id || "001"}`}
                    primaryTypographyProps={{ variant: "caption", color: "text.muted" }}
                    secondaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                  />
                </ListItem>
              </List>

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  disabled={!inStock}
                  onClick={() => navigate(`/student/book/${item.id || item._id}`)}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                    backgroundColor: "#1e3a8a",
                    "&:hover": { backgroundColor: "#172554" },
                  }}
                >
                  Book Equipment
                </Button>

                <Button
                  variant={inStock ? "outlined" : "contained"}
                  size="large"
                  color={inStock ? "primary" : "warning"}
                  startIcon={<HourglassEmptyIcon />}
                  onClick={() => setIsWaitlistModalOpen(true)}
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  Join Waitlist
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

      {/* Join Waitlist Modal */}
      <JoinWaitlistModal
        open={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        equipmentItem={item}
        onSuccess={(entry) => {
          setSnackbarMsg(`Successfully joined waitlist for ${entry.equipmentName || item.name}!`);
          setSnackbarOpen(true);
        }}
      />

      {/* Toast Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", quantity: 8, availableQuantity: 6, status: "Available", description: "Dual-channel digital storage oscilloscope with 100MHz bandwidth. Highly accurate for measuring sinusoidal waveform dynamics and voltage variations over time.", department: "Electrical Engineering" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", quantity: 3, availableQuantity: 0, status: "Booked", description: "Double-beam spectrophotometer with wavelength range 190-1100nm. Highly recommended for spectral assays and chemical concentration analysis.", department: "Applied Chemistry" },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", quantity: 5, availableQuantity: 5, status: "Available", description: "High-speed laboratory centrifuge with temperature controls. Capable of speeds up to 15,000 RPM with multiple rotor options.", department: "Molecular Biology" },
];
