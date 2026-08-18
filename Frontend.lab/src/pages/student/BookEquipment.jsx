import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import api from "../../services/api";
import JoinWaitlistModal from "../../components/JoinWaitlistModal";

export default function BookEquipment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("Booking request submitted successfully! Redirecting to My Bookings...");

  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bookingDate: new Date().toISOString().split("T")[0],
      returnDate: "",
      purpose: "",
      quantity: 1,
    },
  });

  const loadDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const response = await api.get(`/equipment/${id}`);
      setItem(response.data);
    } catch (err) {
      console.warn("GET /equipment/id failed. Fetching mock details.", err);
      const matched = MOCK_EQUIPMENT.find((x) => x.id === id);
      if (matched) {
        setItem(matched);
      } else {
        setErrorMsg("Equipment item not found.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const onSubmit = async (data) => {
    if (!item) return;

    if (new Date(data.returnDate) < new Date(data.bookingDate)) {
      setErrorMsg("Return date must be after or equal to the booking date.");
      return;
    }

    setSubmitLoading(true);
    setErrorMsg("");
    try {
      const email = localStorage.getItem("email") || "";
      let matchedUser = null;
      try {
        const usersResp = await api.get("/users");
        matchedUser = (usersResp.data || []).find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
      } catch (err) {
        console.warn("Failed to retrieve user registry. Falling back to session mock.", err);
      }

      const userPayload = matchedUser
        ? { id: matchedUser.id, name: matchedUser.name, email: matchedUser.email, role: matchedUser.role }
        : { id: 1, name: localStorage.getItem("name") || "Student User", email: email || "student@test.com", role: "STUDENT" };

      const payload = {
        bookingDate: data.bookingDate,
        returnDate: data.returnDate,
        status: "PENDING",
        user: userPayload,
        equipment: {
          id: Number(item.id || item._id),
          name: item.name,
          description: item.description || "Laboratory Equipment",
          category: item.category || "General",
          quantity: item.quantity || 1,
          availableQuantity: item.availableQuantity || 1,
          status: item.status || "AVAILABLE"
        },
      };

      await api.post("/bookings", payload);
      setSnackbarOpen(true);

      // Redirect to bookings list after 2 seconds
      setTimeout(() => {
        navigate("/student/bookings");
      }, 2000);
    } catch (err) {
      console.warn("POST /bookings failed. Completing reservation locally (Demo Mode).", err);
      
      try {
        const localBookings = JSON.parse(localStorage.getItem("local_bookings") || "[]");
        const newBooking = {
          id: "mock-" + Math.floor(Math.random() * 100000),
          bookingDate: data.bookingDate,
          returnDate: data.returnDate,
          status: "Pending",
          username: localStorage.getItem("username") || "Student",
          user: userPayload,
          equipment: {
            id: item.id || item._id,
            name: item.name,
            category: item.category || "General",
          }
        };
        localBookings.push(newBooking);
        localStorage.setItem("local_bookings", JSON.stringify(localBookings));
      } catch (localErr) {
        console.error("Failed to save booking to localStorage", localErr);
      }

      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/student/bookings");
      }, 2000);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg && !item) {
    return (
      <Container maxWidth="sm">
        <Button startIcon={<KeyboardBackspaceIcon />} onClick={() => navigate("/equipment")} sx={{ mb: 3 }}>
          Back
        </Button>
        <Alert severity="error">{errorMsg}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ animation: "fadeIn 0.2s ease-in-out" }}>
      <Container maxWidth="sm">
        <Button
          startIcon={<KeyboardBackspaceIcon />}
          onClick={() => navigate(`/equipment/${id}`)}
          sx={{ mb: 3, fontWeight: 700 }}
        >
          Back to Details
        </Button>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            border: "1px solid #e2e8f0",
            backgroundColor: "background.paper",
          }}
        >
          <Box mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
              Request Reservation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Provide dates and project reasons below.
            </Typography>
          </Box>

          {item && (item.availableQuantity ?? 0) <= 0 && (
            <Alert
              severity="warning"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<HourglassEmptyIcon />}
                  onClick={() => setIsWaitlistModalOpen(true)}
                  sx={{ fontWeight: 700 }}
                >
                  Join Waitlist
                </Button>
              }
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              This equipment is currently <strong>out of stock</strong>. You can join the waiting list to reserve your queue position.
            </Alert>
          )}

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Equipment Name (read-only) */}
            <TextField
              margin="normal"
              fullWidth
              label="Equipment Name"
              value={item?.name || ""}
              InputProps={{ readOnly: true }}
              sx={{ mb: 1.5, backgroundColor: "#f8fafc" }}
            />

            {/* Available Quantity Info */}
            <TextField
              margin="normal"
              fullWidth
              label="Available Quantity"
              value={item?.availableQuantity ?? 1}
              InputProps={{ readOnly: true }}
              sx={{ mb: 1.5, backgroundColor: "#f8fafc" }}
            />

            {/* Booking Date */}
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Booking Date"
              InputLabelProps={{ shrink: true }}
              {...register("bookingDate", { required: "Booking Date is required" })}
              error={!!errors.bookingDate}
              helperText={errors.bookingDate?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Return Date */}
            <TextField
              margin="normal"
              required
              fullWidth
              type="date"
              label="Return Date"
              InputLabelProps={{ shrink: true }}
              {...register("returnDate", { required: "Return Date is required" })}
              error={!!errors.returnDate}
              helperText={errors.returnDate?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Purpose */}
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={3}
              label="Purpose / Project Details"
              placeholder="Explain the academic goal or project details requiring this resource."
              {...register("purpose", { required: "Purpose is required" })}
              error={!!errors.purpose}
              helperText={errors.purpose?.message}
              sx={{ mb: 1.5 }}
            />

            {/* Quantity */}
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              label="Quantity to Request"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Request quantity must be at least 1" },
                max: {
                  value: item?.availableQuantity || 1,
                  message: `Maximum available stock is ${item?.availableQuantity || 1}`,
                },
              })}
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              sx={{ mb: 3 }}
            />

            {/* Submit */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={submitLoading}
              sx={{
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "1rem",
                backgroundColor: "#1e3a8a",
                "&:hover": { backgroundColor: "#172554" },
              }}
            >
              {submitLoading ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Submitting Request...</span>
                </Box>
              ) : (
                "Book Equipment"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Join Waitlist Modal */}
      <JoinWaitlistModal
        open={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        equipmentItem={item}
        onSuccess={(entry) => {
          setSnackbarMsg(`Successfully added to waitlist for ${entry.equipmentName || item.name}! Redirecting...`);
          setSnackbarOpen(true);
          setTimeout(() => {
            navigate("/student/waitlist");
          }, 1500);
        }}
      />

      {/* Success Snackbar popup */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%", borderRadius: 2 }}>
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", availableQuantity: 6 },
  { id: "2", name: "UV-Vis Spectrophotometer", availableQuantity: 0 },
  { id: "3", name: "Refrigerated Centrifuge", availableQuantity: 5 },
];
