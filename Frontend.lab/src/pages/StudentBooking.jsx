import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../api/axiosConfig";

export default function StudentBooking() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedEquip, setSelectedEquip] = useState(null);
  
  // Loading & Alert States
  const [loadingEquip, setLoadingEquip] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split("T")[0],
    returnDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Fetch Available Equipment and Booking History
  const fetchEquipment = async () => {
    try {
      setLoadingEquip(true);
      const response = await api.get("/equipment");
      setEquipmentList(response.data || []);
    } catch (err) {
      console.warn("Failed to fetch equipment catalog. Loading demo items.", err);
      setEquipmentList(MOCK_EQUIPMENT);
    } finally {
      setLoadingEquip(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await api.get("/bookings/my");
      setMyBookings(response.data || []);
    } catch (err) {
      console.warn("Failed to fetch personal bookings history. Loading demo logs.", err);
      setMyBookings(MOCK_BOOKINGS);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
    fetchMyBookings();
  }, []);

  const handleSelectEquipment = (item) => {
    setSelectedEquip(item);
    setSuccessMsg("");
    setErrorMsg("");
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.bookingDate) {
      errors.bookingDate = "Booking date is required.";
      isValid = false;
    }
    if (!formData.returnDate) {
      errors.returnDate = "Return date is required.";
      isValid = false;
    } else if (new Date(formData.returnDate) < new Date(formData.bookingDate)) {
      errors.returnDate = "Return date must be after or equal to the booking date.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validateForm()) return;

    setBookingInProgress(true);
    const payload = {
      equipmentId: selectedEquip.id || selectedEquip._id,
      bookingDate: formData.bookingDate,
      returnDate: formData.returnDate,
    };

    try {
      await api.post("/bookings", payload);
      setSuccessMsg(`Successfully booked ${selectedEquip.name}!`);
      setSelectedEquip(null);
      setFormData({
        bookingDate: new Date().toISOString().split("T")[0],
        returnDate: "",
      });
      fetchEquipment();
      fetchMyBookings();
    } catch (err) {
      console.warn("POST /bookings API failed. Simulating locally (Demo Mode)...", err);
      // Offline fallback
      const newBooking = {
        id: String(Date.now()),
        equipmentName: selectedEquip.name,
        bookingDate: formData.bookingDate,
        returnDate: formData.returnDate,
        status: "Pending",
      };
      setMyBookings([newBooking, ...myBookings]);
      
      // Update locally selected availableQuantity
      setEquipmentList((prevList) =>
        prevList.map((item) =>
          (item.id || item._id) === selectedEquip.id
            ? { ...item, availableQuantity: Math.max(0, item.availableQuantity - 1) }
            : item
        )
      );

      setSuccessMsg(`Successfully booked ${selectedEquip.name} (Demo Mode)!`);
      setSelectedEquip(null);
      setFormData({
        bookingDate: new Date().toISOString().split("T")[0],
        returnDate: "",
      });
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setErrorMsg("");
      setSuccessMsg("");
      try {
        await api.delete(`/bookings/${id}`);
        setSuccessMsg("Booking cancelled successfully.");
        fetchEquipment();
        fetchMyBookings();
      } catch (err) {
        console.warn("DELETE /bookings API failed. Simulating cancellation locally...", err);
        // Fallback
        setMyBookings((prev) => prev.filter((b) => (b.id || b._id) !== id));
        setSuccessMsg("Booking cancelled (Demo Mode).");
      }
    }
  };

  const getStatusChipColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "completed":
        return "info";
      case "cancelled":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Filter equipment with stock available and Available status
  const availableResources = equipmentList.filter(
    (item) => (item.availableQuantity ?? 1) > 0 && item.status?.toLowerCase() === "available"
  );

  return (
    <Box sx={{ animation: "fadeIn 0.3s ease-in-out" }}>
      {/* Title section */}
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Laboratory Resource Booking
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Search for available equipment, submit booking requests, and track status.
        </Typography>
      </Box>

      {/* Action alerts */}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Side: Available Equipment List */}
        <Grid item xs={12} md={7}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Available Lab Resources
          </Typography>

          {loadingEquip ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={30} />
            </Box>
          ) : availableResources.length > 0 ? (
            <Grid container spacing={2}>
              {availableResources.map((item) => (
                <Grid item xs={12} sm={6} key={item.id || item._id}>
                  <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                        Category: {item.category}
                      </Typography>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Chip
                          label={`${item.availableQuantity} available`}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: "6px" }}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleSelectEquipment(item)}
                          sx={{ textTransform: "none", borderRadius: 1.5, px: 2 }}
                        >
                          Select
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No available lab equipment in stock at the moment.
            </Alert>
          )}
        </Grid>

        {/* Right Side: Booking Form */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Booking Form
          </Typography>

          {selectedEquip ? (
            <Card sx={{ border: "1px solid #e2e8f0", boxShadow: "none", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                  <CalendarTodayIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Reserve Resource
                  </Typography>
                </Box>

                <Box component="form" onSubmit={handleBookSubmit} noValidate>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Equipment Name"
                        value={selectedEquip.name}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>

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

                    <Grid item xs={12}>
                      <Box display="flex" gap={2} mt={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => setSelectedEquip(null)}
                          sx={{ textTransform: "none", borderRadius: 2 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          fullWidth
                          type="submit"
                          variant="contained"
                          disabled={bookingInProgress}
                          sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}
                        >
                          {bookingInProgress ? "Booking..." : "Book Equipment"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                border: "2px dashed #cbd5e1",
                borderRadius: 3,
                backgroundColor: "#f8fafc",
              }}
            >
              <Typography color="text.secondary" variant="body2">
                Select an equipment from the list to populate the booking form.
              </Typography>
            </Box>
          )}
        </Grid>

        {/* Bottom Section: Booking History */}
        <Grid item xs={12}>
          <Box mt={3} mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              My Booking History
            </Typography>
          </Box>

          {loadingBookings ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={30} />
            </Box>
          ) : myBookings.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ borderRadius: 3, border: "1px solid #e2e8f0", boxShadow: "none", overflow: "hidden" }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ backgroundColor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Booking Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Return Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myBookings.map((b) => {
                    const bookingId = b.id || b._id;
                    const isCancellable =
                      b.status?.toLowerCase() === "pending" ||
                      b.status?.toLowerCase() === "approved";
                      
                    return (
                      <TableRow key={bookingId} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                        <TableCell sx={{ fontWeight: 600 }}>{b.equipmentName || b.equipment?.name || "Equipment"}</TableCell>
                        <TableCell>{b.bookingDate}</TableCell>
                        <TableCell>{b.returnDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={b.status || "Pending"}
                            color={getStatusChipColor(b.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {isCancellable ? (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CancelIcon />}
                              onClick={() => handleCancelBooking(bookingId)}
                              sx={{ borderRadius: 1.5, textTransform: "none", py: 0.5 }}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              No Actions
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                backgroundColor: "#ffffff",
              }}
            >
              <Typography color="text.secondary" variant="body1">
                You have not booked any resources yet. Your booking history is empty.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

// Offline Mock Catalogs
const MOCK_EQUIPMENT = [
  { id: "1", name: "Digital Oscilloscope 100MHz", category: "Electronics", availableQuantity: 6, status: "Available" },
  { id: "2", name: "UV-Vis Spectrophotometer", category: "Chemistry", availableQuantity: 0, status: "Booked" },
  { id: "3", name: "Refrigerated Centrifuge", category: "Biology", availableQuantity: 5, status: "Available" },
  { id: "4", name: "Binocular Compound Microscope", category: "Biology", availableQuantity: 9, status: "Available" },
];

const MOCK_BOOKINGS = [
  { id: "101", equipmentName: "Digital Oscilloscope 100MHz", bookingDate: "2026-07-15", returnDate: "2026-07-20", status: "Approved" },
  { id: "102", equipmentName: "Refrigerated Centrifuge", bookingDate: "2026-07-16", returnDate: "2026-07-22", status: "Pending" },
];
