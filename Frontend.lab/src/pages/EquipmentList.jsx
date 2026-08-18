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
  IconButton,
  Button,
  Tooltip,
  Typography,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../context/AuthContext";

export default function EquipmentList({ equipment, onEdit, onDelete, onBook, onView }) {
  const { user } = useAuth();
  
  const role = user?.role || localStorage.getItem("role") || "Student";
  const isStudent = role.toLowerCase() === "student";
  const isManagerial =
    role === "Lab Technician" ||
    role === "Lab Manager" ||
    role === "System Admin";

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "success";
      case "booked":
        return "warning";
      case "maintenance":
      case "under maintenance":
        return "error";
      case "unavailable":
      default:
        return "default";
    }
  };

  const safeEquipment = Array.isArray(equipment) ? equipment : [];

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
      <Table sx={{ minWidth: 700 }} aria-label="equipment catalog table">
        <TableHead sx={{ backgroundColor: "#f8fafc" }}>
          {isStudent ? (
            /* Student Column Headers */
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Equipment Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Available Qty
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Action
              </TableCell>
            </TableRow>
          ) : (
            /* Non-Student Column Headers (Technician, Manager, Admin) */
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Qty
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Avail Qty
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: "#475569" }} align="center">
                Actions
              </TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {safeEquipment.length > 0 ? (
            safeEquipment.map((item) => {
              const itemId = item.id || item._id;
              const isAvailable = item.availableQuantity > 0 && item.status?.toLowerCase() === "available";
              
              return (
                <TableRow
                  key={itemId}
                  sx={{
                    "&:hover": { backgroundColor: "#f8fafc" },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {isStudent ? (
                    /* Student Table Row Rendering */
                    <>
                      {/* Equipment Name */}
                      <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.name}
                      </TableCell>
                      
                      {/* Category */}
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      {/* Available Quantity */}
                      <TableCell align="center" sx={{ fontWeight: 600, color: item.availableQuantity > 0 ? "success.main" : "error.main" }}>
                        {item.availableQuantity ?? item.quantity}
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      
                      {/* Actions: View and Book only */}
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => onView(item)}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              py: 0.5,
                            }}
                          >
                            View
                          </Button>
                          
                          <Tooltip title={isAvailable ? "Request Booking" : "Not Available for Booking"}>
                            <span>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<BookOnlineIcon />}
                                disabled={!isAvailable}
                                onClick={() => onBook(item)}
                                sx={{
                                  borderRadius: "6px",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  py: 0.5,
                                }}
                              >
                                Book
                              </Button>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </>
                  ) : (
                    /* Non-Student Table Row Rendering (Technician, Manager, Admin) */
                    <>
                      {/* Name */}
                      <TableCell sx={{ fontWeight: 600, color: "#0f172a" }}>
                        {item.name}
                      </TableCell>
                      
                      {/* Description */}
                      <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.description}
                      </TableCell>
                      
                      {/* Category */}
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{
                            backgroundColor: "#f1f5f9",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      
                      {/* Qty */}
                      <TableCell align="center">{item.quantity}</TableCell>
                      
                      {/* Avail Qty */}
                      <TableCell align="center" sx={{ fontWeight: 600, color: item.availableQuantity > 0 ? "success.main" : "error.main" }}>
                        {item.availableQuantity ?? item.quantity}
                      </TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={getStatusColor(item.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                          {/* Booking Action */}
                          <Tooltip title={isAvailable ? "Request Booking" : "Not Available for Booking"}>
                            <span>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<BookOnlineIcon />}
                                disabled={!isAvailable}
                                onClick={() => onBook(item)}
                                sx={{
                                  borderRadius: "6px",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  py: 0.5,
                                }}
                              >
                                Book
                              </Button>
                            </span>
                          </Tooltip>

                          {/* Management Actions */}
                          {isManagerial && (
                            <>
                              <Tooltip title="Edit Equipment">
                                <IconButton
                                  color="info"
                                  size="small"
                                  onClick={() => onEdit(item)}
                                  sx={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    p: 0.5,
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Delete Equipment">
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => onDelete(itemId)}
                                  sx={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "6px",
                                    p: 0.5,
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={isStudent ? 5 : 7} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary" variant="body1">
                  No equipment matches the search query or filter constraints.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
