import React from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  LinearProgress,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ScienceIcon from "@mui/icons-material/Science";

export default function DepartmentCostTable({ data = [] }) {
  const defaultDepartmentData = [
    { department: "Department of Physics", cost: 185000, equipment: 14, usageHours: 320, percentage: 38 },
    { department: "Department of Chemistry & Materials", cost: 142000, equipment: 10, usageHours: 250, percentage: 29 },
    { department: "Biotechnology & Life Sciences", cost: 98000, equipment: 8, usageHours: 190, percentage: 20 },
    { department: "Electrical & Robotics Engineering", cost: 60200, equipment: 6, usageHours: 120, percentage: 13 },
  ];

  const tableRows = data.length > 0 ? data : defaultDepartmentData;

  return (
    <Paper sx={{ borderRadius: 4, p: 3, boxShadow: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: "#2563eb", width: 36, height: 36 }}>
            <ApartmentIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e3a8a", lineHeight: 1.2 }}>
              Inter-Department Cost Allocation Breakdown
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Cost distribution across academic departments based on equipment runtime and maintenance contributions.
            </Typography>
          </Box>
        </Box>
        <Chip label={`${tableRows.length} Active Departments`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />
      </Box>

      <TableContainer sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 800 }}>Department Name</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Equipment Allocated</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Total Usage (Hrs)</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Share Ratio (%)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Allocated Cost (₹)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((d, index) => {
              const costVal = typeof d.cost === "number" ? d.cost : parseFloat(d.cost || 0);
              const usage = d.usageHours || Math.round((costVal / 600));
              const pct = d.percentage || Math.round((costVal / 485200) * 100);

              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: "rgba(37, 99, 235, 0.1)", color: "#2563eb", width: 32, height: 32, fontSize: "0.85rem", fontWeight: 700 }}>
                        {d.department.charAt(0)}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {d.department}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<ScienceIcon fontSize="small" />}
                      label={`${d.equipment || 5} Units`}
                      size="small"
                      sx={{ fontWeight: 600, bgcolor: "#eff6ff", color: "#1d4ed8" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {usage} hrs
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "#2563eb" } }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 32 }}>
                        {pct}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#1e3a8a" }}>
                      ₹{costVal.toLocaleString("en-IN")}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
