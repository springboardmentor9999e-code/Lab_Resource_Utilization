import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import BookingList from "./BookingList";
import Loading from "../components/Loading";

export default function Booking() {
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    equipmentId: "",
    bookingDate: new Date().toISOString().split("T")[0],
    returnDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role || localStorage.getItem("role") || "Student";
  const isStudent = role === "Student";

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Determine booking endpoint based on role
      const bookingsEndpoint = isStudent ? "/bookings/my" : "/bookings";
      
      const [bookingsResp, equipResp] = await Promise.allSettled([
        api.get(bookingsEndpoint),
        api.get("/equipment"),
      ]);

      if (bookingsResp.status === "fulfilled") {
        setBookings(bookingsResp.value.data || []);
      } else {
        console.warn("Failed to fetch bookings. Loading demo records.");
        setBookings(MOCK_BOOKINGS);
      }

      if (equipResp.status === "fulfilled") {
        setEquipmentList(equipResp.value.data || []);
      } else {
        console.warn("Failed to fetch equipment catalog. Loading demo catalog.");
        setEquipmentList(MOCK_EQUIPMENT);
      }
    } catch (err) {
      console.error("Booking page loading error:", err);
      setError("Cannot sync with server. Showing cached booking files.");
      setBookings(MOCK_BOOKINGS);
      setEquipmentList(MOCK_EQUIPMENT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        setError("");
        setSuccess("");
        await api.delete(`/bookings/${id}`);
        setSuccess("Booking has been successfully cancelled.");
        loadData();
      } catch (err) {
        console.warn("Cancel API failed, applying local state update...", err);
        // Local fallback update
        setBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === id ? { ...b, status: "Cancelled" } : b
          )
        );
        setSuccess("Booking cancelled (Demo Mode).");
        setTimeout(() => setSuccess(""), 4000);
      }
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    if (!formData.equipmentId) {
      tempErrors.equipmentId = "Please select an equipment to book.";
      isValid = false;
    }
    if (!formData.bookingDate) {
      tempErrors.bookingDate = "Booking date is required.";
      isValid = false;
    }
    if (!formData.returnDate) {
      tempErrors.returnDate = "Return date is required.";
      isValid = false;
    } else if (new Date(formData.returnDate) < new Date(formData.bookingDate)) {
      tempErrors.returnDate = "Return date must be after or equal to booking date.";
      isValid = false;
    }

    setFormErrors(tempErrors);
    return isValid;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const selectedEquip = equipmentList.find(
        (eq) => (eq.id || eq._id) === formData.equipmentId
      );
      const username = localStorage.getItem("username") || user?.role || "Student User";
      
      const payload = {
        equipmentId: formData.equipmentId,
        equipmentName: selectedEquip ? selectedEquip.name : "Laboratory Equipment",
        username: username,
        bookingDate: formData.bookingDate,
        returnDate: formData.returnDate,
        status: "Pending",
      };

      await api.post("/bookings", payload);
      setSuccess("Booking request created successfully!");
      setFormData({
        equipmentId: "",
        bookingDate: new Date().toISOString().split("T")[0],
        returnDate: "",
      });
      loadData();
    } catch (err) {
      console.warn("Booking creation endpoint failed. Simulating locally...", err);
      
      // Offline fallback
      const selectedEquip = equipmentList.find(
        (eq) => (eq.id || eq._id) === formData.equipmentId
      );
      const username = localStorage.getItem("username") || user?.role || "Student User";
      
      const newBooking = {
        id: String(Date.now()),
        equipmentName: selectedEquip ? selectedEquip.name : "Laboratory Equipment",
        username: username,
        bookingDate: formData.bookingDate,
        returnDate: formData.returnDate,
        status: "Pending",
      };

      setBookings([newBooking, ...bookings]);
      setSuccess("Booking request submitted (Demo Mode)!");
      
      // Subtract availability locally
      if (selectedEquip) {
        setEquipmentList(
          equipmentList.map((eq) =>
            (eq.id || eq._id) === selectedEquip.id
              ? { ...eq, availableQuantity: Math.max(0, eq.availableQuantity - 1) }
              : eq
          )
        );
      }

      setFormData({
        equipmentId: "",
        bookingDate: new Date().toISOString().split("T")[0],
        returnDate: "",
      });
      
      setTimeout(() => setSuccess(""), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter only equipment that is currently Available and has stock
  const bookableEquipment = equipmentList.filter(
    (item) => item.status?.toLowerCase() === "available" && (item.availableQuantity ?? 1) > 0
  );

  const displayTitle = isStudent ? "My Booking History" : "System Booking Log";

  if (loading && bookings.length === 0) {
    return <Loading message="Loading bookings catalog..." />;
  }

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Resource Bookings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Request laboratory equipment and manage reservations.
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Booking Creation Form - Only visible/relevant for Student requests */}
        {isStudent && (
          <Grid item xs={12} md={4}>
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                  New Booking Request
                </Typography>
                
                <Box component="form" onSubmit={handleFormSubmit} noValidate>
                  <Grid container spacing={2}>
                    {/* Equipment Dropdown */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        select
                        required
                        label="Select Equipment"
                        name="equipmentId"
                        value={formData.equipmentId}
                        onChange={handleFormChange}
                        error={!!formErrors.equipmentId}
                        helperText={formErrors.equipmentId || `Available: ${bookableEquipment.length} catalog items`}
                      >
                        {bookableEquipment.map((item) => (
                          <MenuItem key={item.id || item._id} value={item.id || item._id}>
                            {item.name} ({item.availableQuantity} left)
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Booking Date */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Booking Date"
                        type="date"
                        name="bookingDate"
                        value={formData.bookingDate}
                        onChange={handleFormChange}
                        error={!!formErrors.bookingDate}
                        helperText={formErrors.bookingDate}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: new Date().toISOString().split("T")[0],
                        }}
                      />
                    </Grid>

                    {/* Return Date */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        required
                        label="Return Date"
                        type="date"
                        name="returnDate"
                        value={formData.returnDate}
                        onChange={handleFormChange}
                        error={!!formErrors.returnDate}
                        helperText={formErrors.returnDate}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: formData.bookingDate || new Date().toISOString().split("T")[0],
                        }}
                      />
                    </Grid>

                    {/* Submit Request */}
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        startIcon={<AddIcon />}
                        sx={{
                          mt: 1,
                          backgroundColor: "#0284c7",
                          "&:hover": { backgroundColor: "#0369a1" },
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 2,
                          py: 1,
                        }}
                      >
                        {submitting ? "Submitting..." : "Submit Booking"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* History Table */}
        <Grid item xs={12} md={isStudent ? 8 : 12}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {displayTitle}
            </Typography>
            <BookingList bookings={bookings} onCancel={handleCancelBooking} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// Fallback Mock Equipment Catalog
const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", availableQuantity: 0, status: "Booked" },
  { id: "3", name: "Refrigerated Centrifuge", availableQuantity: 5, status: "Available" },
  { id: "4", name: "Binocular Compound Microscope", availableQuantity: 9, status: "Available" },
];

// Fallback Mock Bookings Log
const MOCK_BOOKINGS = [
  {
    id: "101",
    equipmentName: "Digital Oscilloscope 100MHz",
    username: "Alex Student",
    bookingDate: "2026-07-15",
    returnDate: "2026-07-20",
    status: "Approved",
  },
  {
    id: "102",
    equipmentName: "Refrigerated Centrifuge",
    username: "John Tech",
    bookingDate: "2026-07-16",
    returnDate: "2026-07-22",
    status: "Pending",
  },
  {
    id: "103",
    equipmentName: "Binocular Compound Microscope",
    username: "Sarah Manager",
    bookingDate: "2026-07-10",
    returnDate: "2026-07-12",
    status: "Completed",
  },
];