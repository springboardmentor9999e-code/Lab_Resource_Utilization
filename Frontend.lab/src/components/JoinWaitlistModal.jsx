import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import api from "../services/api";

export default function JoinWaitlistModal({
  open,
  onClose,
  equipmentItem = null,
  equipmentList = [],
  onSuccess,
}) {
  const [selectedEquipId, setSelectedEquipId] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState("Standard");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (equipmentItem) {
      setSelectedEquipId(String(equipmentItem.id || equipmentItem._id || ""));
    } else if (equipmentList.length > 0) {
      setSelectedEquipId(
        String(equipmentList[0].id || equipmentList[0]._id || "")
      );
    }
  }, [equipmentItem, equipmentList, open]);

  const activeEquipment = equipmentItem
    ? equipmentItem
    : equipmentList.find(
        (e) => String(e.id || e._id) === String(selectedEquipId)
      );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!activeEquipment && !selectedEquipId) {
      setErrorMsg("Please select an equipment item.");
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setErrorMsg("End date must be after or equal to start date.");
      return;
    }

    setLoading(true);

    const eqName =
      activeEquipment?.name || activeEquipment?.equipmentName || "Lab Resource";
    const eqId = String(
      activeEquipment?.id || activeEquipment?._id || selectedEquipId || "1"
    );
    const department =
      activeEquipment?.department ||
      activeEquipment?.category ||
      "General Laboratory";

    const payload = {
      equipmentId: eqId,
      equipmentName: eqName,
      department: department,
      requestDate: new Date().toISOString().split("T")[0],
      startDate: startDate,
      endDate: endDate || startDate,
      preferredDates: endDate ? `${startDate} to ${endDate}` : startDate,
      priority: priority,
      notes: notes,
      status: "In Queue",
    };

    try {
      const response = await api.post("/waitlist", payload);
      const createdItem = response.data || payload;
      if (onSuccess) onSuccess(createdItem);
      handleClose();
    } catch (err) {
      console.warn(
        "POST /waitlist failed. Saving waitlist request locally (Demo Mode).",
        err
      );

      try {
        const localList = JSON.parse(
          localStorage.getItem("local_waitlist") || "[]"
        );
        const newLocalEntry = {
          id: "wl-local-" + Math.floor(Math.random() * 100000),
          equipmentId: eqId,
          equipmentName: eqName,
          department: department,
          requestDate: new Date().toISOString().split("T")[0],
          preferredDates: endDate ? `${startDate} to ${endDate}` : startDate,
          queuePosition: localList.length + 1,
          totalInQueue: localList.length + 1,
          estimatedWait: "1-2 Days",
          priority: priority,
          status: "In Queue",
          studentName:
            localStorage.getItem("name") ||
            localStorage.getItem("username") ||
            "Student User",
        };

        localList.push(newLocalEntry);
        localStorage.setItem("local_waitlist", JSON.stringify(localList));

        if (onSuccess) onSuccess(newLocalEntry);
        handleClose();
      } catch (localErr) {
        console.error("Failed to save local waitlist", localErr);
        setErrorMsg("Failed to add to waitlist. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrorMsg("");
    setNotes("");
    setEndDate("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          fontWeight: 800,
          color: "#1e3a8a",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <HourglassEmptyIcon color="primary" />
        Join Equipment Waitlist
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Equipment Selection if not pre-provided */}
          {!equipmentItem && equipmentList.length > 0 ? (
            <TextField
              select
              fullWidth
              label="Select Equipment"
              value={selectedEquipId}
              onChange={(e) => setSelectedEquipId(e.target.value)}
              margin="normal"
              required
            >
              {equipmentList.map((item) => (
                <MenuItem key={item.id || item._id} value={item.id || item._id}>
                  {item.name} ({item.category || "General"})
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              label="Target Equipment"
              value={activeEquipment?.name || "Equipment Resource"}
              margin="normal"
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: "#f8fafc" }}
            />
          )}

          {/* Priority */}
          <TextField
            select
            fullWidth
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            margin="normal"
            required
          >
            <MenuItem value="Standard">Standard Priority</MenuItem>
            <MenuItem value="Urgent">Urgent (Course Project / Exam)</MenuItem>
            <MenuItem value="Emergency">Emergency (Thesis / Publication)</MenuItem>
          </TextField>

          {/* Date Range */}
          <Box display="flex" gap={2} mt={1}>
            <TextField
              fullWidth
              type="date"
              label="Preferred Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              required
              inputProps={{ min: new Date().toISOString().split("T")[0] }}
            />
            <TextField
              fullWidth
              type="date"
              label="Preferred End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              margin="normal"
              inputProps={{
                min: startDate || new Date().toISOString().split("T")[0],
              }}
            />
          </Box>

          {/* Purpose / Project notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Purpose / Usage Justification"
            placeholder="Describe your research or coursework needs for this waitlist slot..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            * When a slot opens up, you will be notified automatically in your waitlist dashboard.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              fontWeight: 700,
              backgroundColor: "#1e3a8a",
              "&:hover": { backgroundColor: "#172554" },
              px: 3,
            }}
          >
            {loading ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={18} color="inherit" />
                <span>Joining Queue...</span>
              </Box>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
