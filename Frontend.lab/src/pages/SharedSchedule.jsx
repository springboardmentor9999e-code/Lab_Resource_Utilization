import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CalendarMonth as CalendarIcon,
  Science as ScienceIcon,
  Apartment as LabIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Public as SharedIcon,
} from "@mui/icons-material";

const MOCK_SCHEDULE = [
  {
    id: 1,
    equipment: "High-Resolution NMR Spectrometer (600 MHz)",
    lab: "Central Characterization Lab",
    institution: "MIT Campus A",
    user: "Dr. Sarah Jenkins",
    userRole: "Researcher (Biology)",
    date: "2026-08-06",
    startTime: "09:00",
    endTime: "12:00",
    status: "CONFIRMED",
    type: "CROSS_LAB_SHARE",
    cost: "$150",
  },
  {
    id: 2,
    equipment: "Scanning Electron Microscope (SEM-500)",
    lab: "Nanotechnology Cleanroom",
    institution: "Tech Institute B",
    user: "Alex Rivera",
    userRole: "Lab Technician",
    date: "2026-08-06",
    startTime: "13:00",
    endTime: "16:00",
    status: "MAINTENANCE",
    type: "MAINTENANCE_SLOT",
    cost: "$0",
  },
  {
    id: 3,
    equipment: "Atomic Force Microscope (AFM Probe Pro)",
    lab: "Physics Quantum Lab",
    institution: "MIT Campus A",
    user: "Prof. Alan Turing",
    userRole: "HOD Physics",
    date: "2026-08-06",
    startTime: "10:30",
    endTime: "14:30",
    status: "CONFIRMED",
    type: "INTERNAL_BOOKING",
    cost: "$80",
  },
  {
    id: 4,
    equipment: "X-Ray Diffractometer (XRD-700)",
    lab: "Materials Analysis Unit",
    institution: "Partner Science Park",
    user: "Elena Rostova",
    userRole: "External Industry Partner",
    date: "2026-08-07",
    startTime: "08:30",
    endTime: "11:30",
    status: "PENDING_APPROVAL",
    type: "EXTERNAL_BOOKING",
    cost: "$300",
  },
  {
    id: 5,
    equipment: "High-Performance Liquid Chromatography (HPLC)",
    lab: "Biochem Analytical Lab",
    institution: "Tech Institute B",
    user: "Michael Scott",
    userRole: "Lab Manager",
    date: "2026-08-07",
    startTime: "14:00",
    endTime: "17:00",
    status: "CONFIRMED",
    type: "CROSS_LAB_SHARE",
    cost: "$120",
  },
];

export default function SharedSchedule() {
  const [selectedDate, setSelectedDate] = useState("2026-08-06");
  const [selectedLab, setSelectedLab] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeSlotDetail, setActiveSlotDetail] = useState(null);

  const filteredSchedule = useMemo(() => {
    return MOCK_SCHEDULE.filter((item) => {
      const matchesDate = item.date === selectedDate;
      const matchesLab = selectedLab === "ALL" || item.lab === selectedLab;
      const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
      return matchesDate && matchesLab && matchesStatus;
    });
  }, [selectedDate, selectedLab, selectedStatus]);

  const getStatusChip = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <Chip label="Confirmed" size="small" color="success" icon={<CheckCircleIcon />} sx={{ fontWeight: 700 }} />;
      case "PENDING_APPROVAL":
        return <Chip label="Pending Approval" size="small" color="warning" icon={<WarningIcon />} sx={{ fontWeight: 700 }} />;
      case "MAINTENANCE":
        return <Chip label="Under Maintenance" size="small" color="error" icon={<InfoIcon />} sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={status} size="small" color="default" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 1.5, color: "#1e3a8a" }}>
            <SharedIcon fontSize="large" color="primary" /> 🌐 Shared Schedule & Resource Timelines
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View real-time equipment availability, inter-laboratory schedules, and shared booking timelines.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setSelectedDate("2026-08-06")}>
            Today
          </Button>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Reserve Shared Slot
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #2563eb", background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                TOTAL SCHEDULED SLOTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                {MOCK_SCHEDULE.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #10b981", background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                CROSS-LAB SHARES
              </Typography>
              <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 0.5 }}>
                {MOCK_SCHEDULE.filter((s) => s.type === "CROSS_LAB_SHARE").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #f59e0b", background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                PENDING REQUESTS
              </Typography>
              <Typography variant="h4" fontWeight={800} color="warning.main" sx={{ mt: 0.5 }}>
                {MOCK_SCHEDULE.filter((s) => s.status === "PENDING_APPROVAL").length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: "4px solid #8b5cf6", background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)" }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                SCHEDULED UTILIZATION
              </Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#8b5cf6", mt: 0.5 }}>
                84.5%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Selected Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              size="small"
              select
              label="Filter Laboratory"
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
            >
              <MenuItem value="ALL">All Laboratories</MenuItem>
              <MenuItem value="Central Characterization Lab">Central Characterization Lab</MenuItem>
              <MenuItem value="Nanotechnology Cleanroom">Nanotechnology Cleanroom</MenuItem>
              <MenuItem value="Physics Quantum Lab">Physics Quantum Lab</MenuItem>
              <MenuItem value="Materials Analysis Unit">Materials Analysis Unit</MenuItem>
              <MenuItem value="Biochem Analytical Lab">Biochem Analytical Lab</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              size="small"
              select
              label="Filter Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="CONFIRMED">Confirmed</MenuItem>
              <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2} sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Showing {filteredSchedule.length} entry(ies)
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon color="primary" /> Timeline Schedule for {selectedDate}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {filteredSchedule.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <CalendarIcon sx={{ fontSize: 60, color: "text.disabled", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              No Scheduled Reservations for Selected Filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Try selecting another date or clearing laboratory filters.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredSchedule.map((item) => (
              <Grid item xs={12} key={item.id}>
                <Card
                  onClick={() => setActiveSlotDetail(item)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderLeft: `6px solid ${
                      item.status === "CONFIRMED" ? "#10b981" : item.status === "PENDING_APPROVAL" ? "#f59e0b" : "#ef4444"
                    }`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 16px -4px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
                        ⏰ {item.startTime} - {item.endTime}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📅 {item.date}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {item.equipment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.2 }}>
                        <LabIcon fontSize="inherit" /> {item.lab} • ({item.institution})
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        👤 {item.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.userRole}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ textAlign: { xs: "left", md: "right" } }}>
                      {getStatusChip(item.status)}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {activeSlotDetail && (
        <Dialog open={Boolean(activeSlotDetail)} onClose={() => setActiveSlotDetail(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Schedule Details</DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" color="primary" fontWeight={700}>
              {activeSlotDetail.equipment}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Laboratory: {activeSlotDetail.lab} ({activeSlotDetail.institution})
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  RESERVED BY
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {activeSlotDetail.user}
                </Typography>
                <Typography variant="caption">{activeSlotDetail.userRole}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  TIME SLOT
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {activeSlotDetail.startTime} - {activeSlotDetail.endTime}
                </Typography>
                <Typography variant="caption">{activeSlotDetail.date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  STATUS
                </Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(activeSlotDetail.status)}</Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  ESTIMATED COST
                </Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">
                  {activeSlotDetail.cost}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActiveSlotDetail(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
