import { useEffect, useState } from "react";
import bookingService from "../../services/bookingService";
import BookingDialog from "../Bookings/BookingDialog";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";


import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

import {
  isStudent,
  isFaculty,
  isLabAssistant,
  isDepartmentHead,
  isInstituteAdmin,
  isSystemAdmin,
  getUserId,
  getInstitutionId,
} from "../../utils/roleUtils";

function Bookings() {

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {

      let data = [];

      if (isSystemAdmin()) {

        data = await bookingService.getAllBookings();

      } else if (isStudent() || isFaculty()) {

        data = await bookingService.getBookingsByUser(getUserId());

      } else if (isLabAssistant()) {

        data = await bookingService.getTodaysBookings();

      } else if (isDepartmentHead()) {

        data = await bookingService.getPendingBookings( 
          getInstitutionId()
        );

      }
      else if (isInstituteAdmin()) {

        data = await bookingService.getBookingsByInstitution(
            getInstitutionId()
        );

    }

      setBookings(data);

    } catch (error) {

      console.error(error);

    }
  };

  const handleOpenDialog = (booking = null) => {
  setSelectedBooking(booking);
  setOpenDialog(true);
};

const handleCloseDialog = () => {
  setSelectedBooking(null);
  setOpenDialog(false);
};

const handleSaveBooking = async (booking) => {
  try {

    if (booking.bookingId) {
      await bookingService.updateBooking(booking.bookingId, booking);
      showSnackbar("Booking updated successfully!");
    } else {
      console.log("Booking Payload:", booking);
      await bookingService.createBooking(booking);
      showSnackbar("Booking created successfully!");
    }

    loadBookings();
    handleCloseDialog();

  } catch (error) {
    console.log("Backend Error:", error.response);

    const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save booking!";

    showSnackbar(errorMessage, "error");
}

};

  const filteredBookings = bookings.filter((booking) =>
    booking.user?.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleApprove = async (id) => {
  try {
    await bookingService.approveBooking(id);
    showSnackbar("Booking approved successfully!");
    loadBookings();
  } catch (error) {
    console.error(error);
    showSnackbar("Failed to approve booking!", "error");
  }
};

const handleReject = async (id) => {
  try {
    await bookingService.rejectBooking(id);
    showSnackbar("Booking rejected successfully!", "warning");
    loadBookings();
  } catch (error) {
    console.error(error);
    showSnackbar("Failed to reject booking!", "error");
  }
};

const handleComplete = async (id) => {
    try {

        await bookingService.completeBooking(id);

        showSnackbar("Booking completed successfully!");

        loadBookings();

    } catch (error) {

        console.error(error);

        showSnackbar("Failed to complete booking!", "error");

    }
};

const handleDelete = async (id) => {
  try {
    await bookingService.deleteBooking(id);
    showSnackbar("Booking deleted successfully!", "error");
    loadBookings();
  } catch (error) {
    console.error(error);
    showSnackbar("Failed to delete booking!", "error");
  }
};

const handleCancel = async (id) => {
    try {

        await bookingService.cancelBooking(id);

        showSnackbar("Booking cancelled successfully!");

        loadBookings();

    } catch (error) {

        console.error(error);

        showSnackbar("Failed to cancel booking!", "error");

    }
};

const showSnackbar = (message, severity = "success") => {
  setSnackbar({
    open: true,
    message,
    severity,
  });
};

const handleCloseSnackbar = () => {
  setSnackbar((prev) => ({
    ...prev,
    open: false,
  }));
};

  return (
    <>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Booking Management
      </Typography>

      <Box
        sx={{
        display:"grid",
        gridTemplateColumns:{
        xs:"1fr",
        md:"repeat(3,minmax(250px,1fr))"
        },
        gap:3,
        mb:4,
        width:"100%"
        }}
        >

<Card
sx={{
    borderRadius:4,
    boxShadow:3,
    textAlign:"center",
    py:2
}}
>

<CardContent>

<Typography color="text.secondary">
Total Bookings
</Typography>

<Typography
variant="h3"
fontWeight="bold"
color="primary"
>
{bookings.length}
</Typography>

</CardContent>

</Card>

<Card
sx={{
    borderRadius:4,
    boxShadow:3,
    textAlign:"center",
    py:2
}}
>

<CardContent>

<Typography color="text.secondary">
Approved
</Typography>

<Typography
variant="h3"
fontWeight="bold"
color="success.main"
>
{bookings.filter(b=>b.status==="APPROVED").length}
</Typography>

</CardContent>

</Card>

<Card
sx={{
    borderRadius:4,
    boxShadow:3,
    textAlign:"center",
    py:2
}}
>

<CardContent>

<Typography color="text.secondary">
Pending
</Typography>

<Typography
variant="h3"
fontWeight="bold"
color="warning.main"
>
{bookings.filter(b=>b.status==="PENDING").length}
</Typography>

</CardContent>

</Card>

</Box>

      <Box
        display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
    >

        <TextField
          label="Search Student"
          placeholder="Enter student name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
              width: 380,
              bgcolor: "#fff",
          }}
      />

        {(isStudent() || isFaculty() || isSystemAdmin()) && (
              <Button
                variant="contained"
                size="large"
                onClick={() => handleOpenDialog()}
              >
                New Booking
              </Button>
            )}

      </Box>

      <TableContainer
          component={Paper}
          sx={{
          borderRadius:4,
          boxShadow:4
          }}
          >
        <Table>

          <TableHead sx={{ background:"#1976d2" }} >
            <TableRow>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Student</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Institution</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Laboratory</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Equipment</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Quantity</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Date</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Start</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>End</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Purpose</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Status</b></TableCell>
                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Actions</b></TableCell>
            </TableRow>
        </TableHead>

          <TableBody>

            {filteredBookings.map((booking)=>(

              <TableRow
                  key={booking.bookingId}
                  hover
                  sx={{
                  "&:hover":{
                  background:"#f7faff"
                  }
                  }}
                  >

                <TableCell>
                    {booking.user?.fullName}
                </TableCell>

                <TableCell>
                    {booking.laboratory?.institution?.institutionName}
                </TableCell>

                <TableCell>
                    {booking.laboratory?.labName}
                </TableCell>

                <TableCell>
                    {booking.equipment?.equipmentName}
                </TableCell>

                <TableCell>
                    {booking.quantity}
                </TableCell>

                <TableCell>
                    {booking.bookingDate}
                </TableCell>

                <TableCell>
                    {booking.startTime}
                </TableCell>

                <TableCell>
                    {booking.endTime}
                </TableCell>

                <TableCell>
                    {booking.purpose}
                </TableCell>

                <TableCell>

                  <Chip
                      label={booking.status}
                      size="small"
                      sx={{
                      fontWeight:"bold"
                      
                      }}
                    color={
                      booking.status==="APPROVED"
                        ? "success"
                        : booking.status==="PENDING"
                        ? "warning"
                        : booking.status==="REJECTED"
                        ? "error"
                        : "default"
                    }
                  />

                </TableCell>
                    
                  
                <TableCell>

                    <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 1,
  }}
>

  {/* STUDENT / FACULTY */}
  {(isStudent() || isFaculty()) && (
  <>
    {booking.status === "PENDING" && (
      <>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleOpenDialog(booking)}
        >
          Edit
        </Button>

        <Button
          size="small"
          color="warning"
          variant="contained"
          onClick={() => handleCancel(booking.bookingId)}
        >
          Cancel
        </Button>
      </>
    )}

    {booking.status !== "PENDING" && (
      <Button
        size="small"
        variant="outlined"
        disabled
      >
        View
      </Button>
    )}
  </>
)}

  {/* DEPARTMENT HEAD */}
  {isDepartmentHead() && booking.status === "PENDING" && (
  <>
    <Button
      size="small"
      variant="contained"
      color="success"
      onClick={() => handleApprove(booking.bookingId)}
    >
      Approve
    </Button>

    <Button
      size="small"
      variant="contained"
      color="error"
      onClick={() => handleReject(booking.bookingId)}
    >
      Reject
    </Button>
  </>
)}

  {/* INSTITUTE ADMIN */}
  {isInstituteAdmin() && booking.status === "PENDING" && (
  <>
    {booking.status === "PENDING" && (
      <>
        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={() => handleApprove(booking.bookingId)}
        >
          Approve
        </Button>

        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => handleReject(booking.bookingId)}
        >
          Reject
        </Button>
      </>
    )}

    {booking.status !== "PENDING" && (
      <Button
        size="small"
        variant="outlined"
        disabled
      >
        View
      </Button>
    )}
  </>
)}

  {isLabAssistant() && (
  <>
    {booking.status === "APPROVED" && (
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={() => handleComplete(booking.bookingId)}
      >
        Complete
      </Button>
    )}

    {booking.status === "COMPLETED" && (
      <Button
        size="small"
        variant="outlined"
        disabled
      >
        Completed
      </Button>
    )}

    {booking.status === "PENDING" && (
      <Button
        size="small"
        variant="outlined"
        disabled
      >
        Waiting Approval
      </Button>
    )}

    {booking.status === "REJECTED" && (
      <Button
        size="small"
        variant="outlined"
        color="error"
        disabled
      >
        Rejected
      </Button>
    )}

    {booking.status === "CANCELLED" && (
      <Button
        size="small"
        variant="outlined"
        color="warning"
        disabled
      >
        Cancelled
      </Button>
    )}
  </>
)}

  {/* SYSTEM ADMIN */}
{/* SYSTEM ADMIN */}
{isSystemAdmin() && (
  <>
    {booking.status === "PENDING" && (
      <>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleOpenDialog(booking)}
        >
          Edit
        </Button>

        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={() => handleApprove(booking.bookingId)}
        >
          Approve
        </Button>

        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => handleReject(booking.bookingId)}
        >
          Reject
        </Button>

        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(booking.bookingId)}
        >
          Delete
        </Button>
      </>
    )}

    {booking.status === "APPROVED" && (
      <>
        <Button
          size="small"
          variant="contained"
          disabled
        >
          View
        </Button>

        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(booking.bookingId)}
        >
          Delete
        </Button>
      </>
    )}

    {booking.status === "REJECTED" && (
      <>
        <Button
          size="small"
          variant="contained"
          disabled
        >
          View
        </Button>

        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(booking.bookingId)}
        >
          Delete
        </Button>
      </>
    )}

    {booking.status === "CANCELLED" && (
      <>
        <Button
          size="small"
          variant="contained"
          disabled
        >
          View
        </Button>

        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(booking.bookingId)}
        >
          Delete
        </Button>
      </>
    )}

    {booking.status === "COMPLETED" && (
      <>
        <Button
          size="small"
          variant="contained"
          disabled
        >
          View
        </Button>

        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(booking.bookingId)}
        >
          Delete
        </Button>
      </>
    )}
  </>
)}

</Box>

                    </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>
        <BookingDialog
          open={openDialog}
          handleClose={handleCloseDialog}
          handleSave={handleSaveBooking}
          booking={selectedBooking}
        />
        <Snackbar
    open={snackbar.open}
    autoHideDuration={4000}
    onClose={handleCloseSnackbar}
    anchorOrigin={{
        vertical: "top",
        horizontal: "right",
    }}
>
    <Alert
        onClose={handleCloseSnackbar}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: "100%" }}
    >
        {snackbar.message}
    </Alert>
</Snackbar>
    </>
  );
}

export default Bookings;