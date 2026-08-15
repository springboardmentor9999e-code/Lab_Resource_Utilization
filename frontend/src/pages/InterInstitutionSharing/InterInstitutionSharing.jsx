import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import interInstitutionSharingService from "../../services/interInstitutionSharingService";
import SharingDialog from "./SharingDialog";
import axiosInstance from "../../utils/axiosInstance";
import {IconButton,Tooltip, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
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
  Snackbar,
  Alert,
} from "@mui/material";

function InterInstitutionSharing() {
    const { role } = useAuth();
    console.log("Logged in Role:", role);
  const [sharingList, setSharingList] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSharing, setSelectedSharing] = useState(null);

  //const role = localStorage.getItem("role");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadSharing();
  }, []);

  const loadSharing = async () => {
    try {
      const data = await interInstitutionSharingService.getAllSharing();
      setSharingList(data);
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Failed to load sharing records",
        severity: "error",
      });
    }
  };

  const handleOpenDialog = (sharing = null) => {
    setSelectedSharing(sharing);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSharing(null);
    setOpenDialog(false);
  };

  const handleSaveSharing = async (sharing) => {
    try {
      if (sharing.sharingId) {
        await interInstitutionSharingService.updateSharing(
          sharing.sharingId,
          sharing
        );
      } else {
        await interInstitutionSharingService.createSharing(sharing);
      }

      loadSharing();
      handleCloseDialog();

      setSnackbar({
        open: true,
        message: sharing.sharingId
          ? "Sharing updated successfully!"
          : "Sharing created successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Operation failed!",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sharing record?")) return;

    try {
      await interInstitutionSharingService.deleteSharing(id);

      loadSharing();

      setSnackbar({
        open: true,
        message: "Deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error(error);

      setSnackbar({
        open: true,
        message: "Delete failed!",
        severity: "error",
      });
    }
  };

    const handleApprove = async (id) => {
      try {
        await interInstitutionSharingService.approveSharing(id);

        await loadSharing();

        setSnackbar({
          open: true,
          message: "Sharing Approved Successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error(error);

        setSnackbar({
          open: true,
          message: "Approval Failed!",
          severity: "error",
        });
      }
    };

    const handleReject = async (id) => {
      try {
        await interInstitutionSharingService.rejectSharing(id);

        await loadSharing();

        setSnackbar({
          open: true,
          message: "Sharing Rejected Successfully!",
          severity: "success",
        });
      } catch (error) {
        console.error(error);

        setSnackbar({
          open: true,
          message: "Reject Failed!",
          severity: "error",
        });
      }
    };


  const filteredSharing = sharingList.filter((item) => {
    const name =
      item.resourceType === "LABORATORY"
        ? item.laboratory?.labName
        : item.equipment?.equipmentName;

    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Inter Institution Sharing
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 3,
          mb: 4,
        }}
      >
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Total Sharing</Typography>
            <Typography variant="h2" color="primary" fontWeight="bold">
              {sharingList.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Active</Typography>
            <Typography variant="h2" color="success.main" fontWeight="bold">
              {sharingList.filter((s) => s.status === "AVAILABLE").length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Laboratories</Typography>
            <Typography variant="h2" color="secondary" fontWeight="bold">
              {
                sharingList.filter((s) => s.resourceType === "LABORATORY").length
              }
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Equipment</Typography>
            <Typography variant="h2" color="warning.main" fontWeight="bold">
              {
                sharingList.filter((s) => s.resourceType === "EQUIPMENT").length
              }
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <TextField
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
        />

        {(
            role === "SYSTEM_ADMIN" ||
            role === "INSTITUTION_ADMIN" ||
            role === "LAB_MANAGER"
        ) && (
            <Button
                variant="contained"
                onClick={handleOpenDialog}
            >
                Add Sharing
            </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead
            sx={{
              "& .MuiTableCell-head": {
                backgroundColor: "#1976d2",
                color: "#fff",
                fontWeight: "bold",
              },
            }}
          >
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>From Institution</TableCell>
              <TableCell>To Institution</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Remarks</TableCell>

              {(
                    role === "SYSTEM_ADMIN" ||
                    role === "INSTITUTE_ADMIN" ||
                    role === "LAB_ASSISTANT"
                ) && (
                    <TableCell>
                        <b>Action</b>
                    </TableCell> )}
                    
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredSharing.map((item) => (
              <TableRow key={item.sharingId} hover>
                <TableCell>{item.resourceType}</TableCell>

                <TableCell>
                  {item.resourceType === "LABORATORY"
                    ? item.laboratory?.labName
                    : item.equipment?.equipmentName}
                </TableCell>

                <TableCell>
                  {item.fromInstitution?.institutionName}
                </TableCell>

                <TableCell>
                  {item.toInstitution?.institutionName}
                </TableCell>

                <TableCell>{item.sharedQuantity}</TableCell>

                <TableCell>
                  {item.availableFrom} - {item.availableTo}
                </TableCell>

                <TableCell>
                  <Chip
                      label={item.status}
                      color={
                        item.status === "APPROVED"
                          ? "success"
                          : item.status === "PENDING"
                          ? "warning"
                          : "error"
                      }
                    />
                </TableCell>

                <TableCell>{item.remarks}</TableCell>

                <TableCell align="center">
  <Stack spacing={1}>
    <Stack direction="row" spacing={1} justifyContent="center">
      {item.status === "PENDING" &&
        (role === "SYSTEM_ADMIN" || role === "INSTITUTION_ADMIN") && (
          <>
            <Tooltip title="Approve">
              <IconButton
                color="success"
                onClick={() => handleApprove(item.sharingId)}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Reject">
              <IconButton
                color="error"
                onClick={() => handleReject(item.sharingId)}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
    </Stack>

    <Stack direction="row" spacing={1} justifyContent="center">
      <Tooltip  title={
          item.status === "PENDING"
            ? "Edit"
            : "Cannot edit after approval/rejection"
        }>
         <span>
            <IconButton
              color="primary"
              disabled={item.status !== "PENDING"}
              onClick={() => handleOpenDialog(item)}
            >
              <EditIcon />
            </IconButton>
          </span>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          color="error"
          onClick={() => handleDelete(item.sharingId)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  </Stack>
</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SharingDialog
          open={openDialog}
          onClose={handleCloseDialog}
          onSave={handleSaveSharing}
          sharing={selectedSharing}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default InterInstitutionSharing;