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
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SendIcon from "@mui/icons-material/Send";

export default function BillingDetails({ data = [] }) {
  const defaultBillingData = [
    { invoiceNo: "INV-2026-081", department: "Physics Quantum Lab", amount: 45000, status: "PAID", dueDate: "2026-08-01" },
    { invoiceNo: "INV-2026-082", department: "Nanotech Cleanroom", amount: 32000, status: "PAID", dueDate: "2026-08-03" },
    { invoiceNo: "INV-2026-083", department: "Materials Analysis Unit", amount: 28500, status: "PENDING", dueDate: "2026-08-15" },
    { invoiceNo: "INV-2026-084", department: "Biochem Analytical Lab", amount: 18200, status: "PENDING", dueDate: "2026-08-20" },
    { invoiceNo: "INV-2026-085", department: "External Partner - TechPark", amount: 18000, status: "OVERDUE", dueDate: "2026-07-28" },
  ];

  const billingRows = data.length > 0 ? data : defaultBillingData;

  const getStatusChip = (status) => {
    const st = (status || "PENDING").toUpperCase();
    switch (st) {
      case "PAID":
        return <Chip label="PAID" color="success" size="small" icon={<CheckCircleOutlinedIcon />} sx={{ fontWeight: 700 }} />;
      case "PENDING":
        return <Chip label="PENDING" color="warning" size="small" icon={<PendingActionsIcon />} sx={{ fontWeight: 700 }} />;
      case "OVERDUE":
        return <Chip label="OVERDUE" color="error" size="small" icon={<ErrorOutlineIcon />} sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={st} size="small" sx={{ fontWeight: 600 }} />;
    }
  };

  return (
    <Paper sx={{ borderRadius: 4, p: 3, boxShadow: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#ecfdf5", color: "#059669" }}>
            <ReceiptLongIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#065f46", lineHeight: 1.2 }}>
              Inter-Lab Billing & Invoices Registry
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recent invoice statements generated for shared equipment bookings and inter-department services.
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="primary" size="small" startIcon={<ReceiptLongIcon />} sx={{ fontWeight: 700 }}>
          Export Billing Report
        </Button>
      </Box>

      <TableContainer sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 800 }}>Invoice #</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Target Department / Partner</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Amount (₹)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {billingRows.map((b, index) => {
              const amt = typeof b.amount === "number" ? b.amount : parseFloat(b.amount || 0);

              return (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e3a8a" }}>
                      {b.invoiceNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 650 }}>
                      {b.department}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      📅 {b.dueDate || "2026-08-15"}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(b.status)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#0f172a" }}>
                      ₹{amt.toLocaleString("en-IN")}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={0.5}>
                      <Tooltip title="View Invoice Statement">
                        <IconButton size="small" color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Payment Reminder">
                        <IconButton size="small" color="secondary">
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
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
