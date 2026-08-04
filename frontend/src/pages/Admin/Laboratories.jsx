import IconButton from "@mui/material/IconButton";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { useEffect, useState } from "react";
import laboratoryService from "../../services/laboratoryService";
import {
    isSystemAdmin,
    isInstituteAdmin,
} from "../../utils/roleUtils";
import Tooltip from "@mui/material/Tooltip";

import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";


function Laboratory() {

  const [laboratories, setLaboratories] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [editing, setEditing] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [newLaboratory, setNewLaboratory] = useState({
    labName: "",
    labCode: "",
    location: "",
    capacity: "",
    status: "Available",
  });

  useEffect(() => {
    loadLaboratories();
  }, []);

  const loadLaboratories = async () => {

    try {

        let data = [];

        if (isSystemAdmin()) {

            data = await laboratoryService.getAllLaboratories();

        } else if (isInstituteAdmin()) {

            data = await laboratoryService.getLaboratoriesByInstitution();

        }

        setLaboratories(data);

    } catch (error) {

        console.error(error);

    }

};

const handleOpenDialog = () => {

    setEditing(false);

    setEditingId(null);

    setNewLaboratory({
        labName: "",
        labCode: "",
        location: "",
        capacity: "",
        status: "Available",
    });

    setOpen(true);
};

  const handleEdit = (lab) => {

    setEditing(true);

    setEditingId(lab.labId);

    setNewLaboratory({
        labName: lab.labName,
        labCode: lab.labCode,
        location: lab.location,
        capacity: lab.capacity,
        status: lab.status,
    });

    setOpen(true);
};

const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this laboratory?"
  );

  if (!confirmDelete) return;

  try {

    await laboratoryService.deleteLaboratory(id);

    setSnackbarMessage("Laboratory Deleted Successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    loadLaboratories();

  } catch (error) {

    console.error(error);

    setSnackbarMessage("Failed to Delete Laboratory");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};
  const handleSave = async () => {

  try {

    if (editing) {

      await laboratoryService.updateLaboratory(editingId, newLaboratory);

    } else {

      if (editing) {

    await laboratoryService.updateLaboratory(
    editingId,
    newLaboratory
);

    setSnackbarMessage("Laboratory Updated Successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);

} else {

    await laboratoryService.createLaboratory(newLaboratory);

    setSnackbarMessage("Laboratory Added Successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
}

    }

    setOpen(false);

    setEditing(false);
    setEditingId(null);

    setNewLaboratory({
      labName: "",
      labCode: "",
      location: "",
      capacity: "",
      status: "Available",
    });

    loadLaboratories();

  } catch (error) {

    console.error(error);
    setSnackbarMessage("Operation Failed");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);

  }
};

  const filteredLaboratories = laboratories.filter((lab) =>
    lab.labName?.toLowerCase().includes(search.toLowerCase()) ||
    lab.labCode?.toLowerCase().includes(search.toLowerCase()) ||
    lab.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Laboratory Management
      </Typography>

      <Box
        display="flex"
        justifyContent="space-between"
        mb={3}
      >
        <TextField
          label="Search Laboratory"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />

        {(isSystemAdmin() || isInstituteAdmin()) && (
        <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
        >
            Add Laboratory
        </Button>
    )}
      </Box>

      <TableContainer component={Paper}>
        <Table>

          <TableHead>
            <TableRow>

              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Lab Name</b></TableCell>
              <TableCell><b>Lab Code</b></TableCell>
              <TableCell><b>Location</b></TableCell>
              <TableCell><b>Capacity</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              
              <TableCell align="center"> <b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

            {filteredLaboratories.map((lab) => (

              <TableRow key={lab.labId}>

                <TableCell>{lab.labId}</TableCell>

                <TableCell>{lab.labName}</TableCell>

                <TableCell>{lab.labCode}</TableCell>

                <TableCell>{lab.location}</TableCell>

                <TableCell>{lab.capacity}</TableCell>

                <TableCell>{lab.status}</TableCell>
                <TableCell align="center">

          {(isSystemAdmin() || isInstituteAdmin()) && (
          <Tooltip title="Edit Laboratory">
          <IconButton
              color="primary"
              onClick={() => handleEdit(lab)}
          >
              <EditIcon />
          </IconButton>
      </Tooltip>

      )}

          {(isSystemAdmin() || isInstituteAdmin()) && (
          <Tooltip title="Delete Laboratory">
    <IconButton
        color="error"
        onClick={() => handleDelete(lab.labId)}
    >
        <DeleteIcon />
    </IconButton>
</Tooltip>
      )}

</TableCell>
              </TableRow>

            ))}

          </TableBody>

        </Table>
      </TableContainer>
      <Dialog
  open={open}
  onClose={() => setOpen(false)}
  fullWidth
  maxWidth="sm"
>

  <DialogTitle>
    {editing ? "Edit Laboratory" : "Add Laboratory"}
  </DialogTitle>

  <DialogContent>

    <TextField
      margin="dense"
      label="Lab Name"
      fullWidth
      value={newLaboratory.labName}
      onChange={(e) =>
        setNewLaboratory({
          ...newLaboratory,
          labName: e.target.value,
        })
      }
    />

    <TextField
      margin="dense"
      label="Lab Code"
      fullWidth
      value={newLaboratory.labCode}
      onChange={(e) =>
        setNewLaboratory({
          ...newLaboratory,
          labCode: e.target.value,
        })
      }
    />

    <TextField
      margin="dense"
      label="Location"
      fullWidth
      value={newLaboratory.location}
      onChange={(e) =>
        setNewLaboratory({
          ...newLaboratory,
          location: e.target.value,
        })
      }
    />

    <TextField
      margin="dense"
      label="Capacity"
      type="number"
      fullWidth
      value={newLaboratory.capacity}
      onChange={(e) =>
        setNewLaboratory({
          ...newLaboratory,
          capacity: e.target.value,
        })
      }
    />

    <TextField
      margin="dense"
      label="Status"
      select
      fullWidth
      value={newLaboratory.status}
      onChange={(e) =>
        setNewLaboratory({
          ...newLaboratory,
          status: e.target.value,
        })
      }
    >
      <MenuItem value="Available">Available</MenuItem>
      <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
      <MenuItem value="Closed">Closed</MenuItem>
    </TextField>

  </DialogContent>

  <DialogActions>

    <Button onClick={() => setOpen(false)}>
      Cancel
    </Button>

    <Button
      variant="contained"
      onClick={handleSave}
    >
      {editing ? "Update Laboratory" : "Save Laboratory"}
    </Button>

  </DialogActions>

</Dialog>

<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    severity={snackbarSeverity}
    variant="filled"
    onClose={() => setSnackbarOpen(false)}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>

    </>
  );
}

export default Laboratory;