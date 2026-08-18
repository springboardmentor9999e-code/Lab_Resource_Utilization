import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Typography,
  Tooltip,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useAuth } from "../context/AuthContext";

export default function BookingList({ bookings, onCancel }) {
  const { user } = useAuth();
  const role = user?.role || localStorage.getItem("role") || "Student";
  const isStudent = role === "Student";

  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "confirmed":
        return <Chip label="Approved" color="success" size="small" sx={{ fontWeight: 600 }} />;
      case "pending":
        return <Chip label="Pending" color="warning" size="small" sx={{ fontWeight: 600 }} />;
      case "completed":
        return <Chip label="Completed" color="info" size="small" sx={{ fontWeight: 600 }} />;
      case "cancelled":
      case "rejected":
        return <Chip label="Cancelled" color="error" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status || "Pending"} size="small" />;
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Table sx={{ minWidth: 650 }} aria-label="bookings list table">
        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
          {isStudent ? (
            /* Student Column Headers */
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Action
              </TableCell>
            </TableRow>
          ) : (
            /* Non-Student Column Headers */
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Student / User</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Booking Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Return Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => {
              const bookingId = booking.id || booking._id;
              const isCancellable =
                booking.status?.toLowerCase() === "pending" ||
                booking.status?.toLowerCase() === "approved";
                
              return (
                <TableRow
                  key={bookingId}
                  sx={{
                    "&:hover": { backgroundColor: "#f8fafc" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {isStudent ? (
                    /* Student Table Row Cells */
                    <>
                      <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {booking.equipmentName || booking.equipment?.name || "Resource"}
                      </TableCell>
                      <TableCell>{booking.bookingDate}</TableCell>
                      <TableCell>{booking.returnDate}</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="center">
                        {isCancellable ? (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => onCancel(bookingId)}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              py: 0.5,
                              "&:hover": {
                                backgroundColor: "rgba(239, 68, 68, 0.04)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            No Actions
                          </Typography>
                        )}
                      </TableCell>
                    </>
                  ) : (
                    /* Non-Student Table Row Cells */
                    <>
                      <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {booking.equipmentName || booking.equipment?.name || "Resource"}
                      </TableCell>
                      <TableCell>{booking.username || booking.user?.username || "Student"}</TableCell>
                      <TableCell>{booking.bookingDate}</TableCell>
                      <TableCell>{booking.returnDate}</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="center">
                        {isCancellable ? (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => onCancel(bookingId)}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              py: 0.5,
                              "&:hover": {
                                backgroundColor: "rgba(239, 68, 68, 0.04)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            No Actions
                          </Typography>
                        )}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isStudent ? 5 : 6} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary" variant="body1">
                  No bookings found in the history log.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
