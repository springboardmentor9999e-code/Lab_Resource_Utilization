import { useEffect, useState } from "react";
import equipmentService from "../../services/equipmentService";
import EquipmentDialog from "../Equipment/EquipmentDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import { isSystemAdmin,isInstituteAdmin,} from "../../utils/roleUtils";

import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
function Equipment() {

  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);

  const IMAGE_BASE_URL = "http://localhost:5173/images/";

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
  try {

    let data = [];

    if (isSystemAdmin()) {

      data = await equipmentService.getAllEquipment();

    } else if (isInstituteAdmin()) {

      data = await equipmentService.getEquipmentByInstitution();

    } else {

      data = await equipmentService.getAllEquipment();

    }

    console.log("Equipment Data:", data);

    setEquipment(data);

  } catch (error) {
    console.error(error);
  }
};

const handleOpenDialog = (equipment = null) => {
  setSelectedEquipment(equipment);
  setOpenDialog(true);
};

const handleCloseDialog = () => {
  setSelectedEquipment(null);
  setOpenDialog(false);
};

const handleOpenDeleteDialog = (equipment) => {
  setEquipmentToDelete(equipment);
  setDeleteDialogOpen(true);
};

const handleCloseDeleteDialog = () => {
  setEquipmentToDelete(null);
  setDeleteDialogOpen(false);
};

const handleDeleteEquipment = async () => {
  try {

    await equipmentService.deleteEquipment(
      equipmentToDelete.equipmentId
    );

    alert("Equipment Deleted Successfully");

    loadEquipment();

    handleCloseDeleteDialog();

  } catch (error) {

    console.error(error);

    alert("Failed to Delete Equipment");
  }
};

const handleSaveEquipment = async (equipmentData) => {
  try {

    if (equipmentData.equipmentId) {

      await equipmentService.updateEquipment(
        equipmentData.equipmentId,
        equipmentData
      );

      alert("Equipment Updated Successfully");

    } else {

      await equipmentService.createEquipment(equipmentData);

      alert("Equipment Added Successfully");
    }

    loadEquipment();
    handleCloseDialog();

  } catch (error) {
    console.error(error);
    alert("Failed to Save Equipment");
  }
};

  const filteredEquipment = equipment.filter((item) => {

  const matchesSearch =
    item.equipmentName
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const matchesCategory =
    categoryFilter === "All" ||
    item.category === categoryFilter;

  return matchesSearch && matchesCategory;

});

  const totalEquipment = equipment.length;

const availableEquipment = equipment.filter(
  (item) => item.status === "Available"
).length;

const inUseEquipment = equipment.filter(
  (item) => item.status === "In Use"
).length;

const maintenanceEquipment = equipment.filter(
  (item) => item.status === "Maintenance"
).length;


  return (
    <>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Equipment Management
      </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 2,
              mb: 3,
            }}
          >

  <Card sx={{borderRadius: 3,boxShadow: 3}}>
    <CardContent>
      <Typography variant="subtitle2">
        Total Equipment
      </Typography>

      <Typography variant="h4" fontWeight="bold">
        {totalEquipment}
      </Typography>
    </CardContent>
  </Card>

  <Card sx={{borderRadius: 3,boxShadow: 3}}>
    <CardContent>
      <Typography variant="subtitle2">
        Available
      </Typography>

      <Typography
        variant="h4"
        fontWeight="bold"
        color="success.main"
      >
        {availableEquipment}
      </Typography>
    </CardContent>
  </Card>

  <Card sx={{borderRadius: 3,boxShadow: 3}}>
      <CardContent>
      <Typography variant="subtitle2">
        In Use
      </Typography>

      <Typography
        variant="h4"
        fontWeight="bold"
        color="warning.main"
      >
        {inUseEquipment}
      </Typography>
    </CardContent>
  </Card>

  <Card sx={{borderRadius: 3,boxShadow: 3}}>
    <CardContent>
      <Typography variant="subtitle2">
        Maintenance
      </Typography>

      <Typography
        variant="h4"
        fontWeight="bold"
        color="error.main"
      >
        {maintenanceEquipment}
      </Typography>
    </CardContent>
  </Card>

</Box>
      <Box
  display="flex"
  alignItems="center"
  gap={2}
  mb={3}
>

  {/* Search Box */}
  <TextField
    placeholder="Search Equipment"
    variant="outlined"
    size="small"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    sx={{ width: 320 }}
    slotProps={{
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      },
    }}
  />

  {/* Category Filter */}
  <TextField
    select
    size="small"
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    sx={{ width: 220 }}
  >
    <MenuItem value="All">All Categories</MenuItem>
    <MenuItem value="Electronics">Electronics</MenuItem>
    <MenuItem value="Physics">Physics</MenuItem>
    <MenuItem value="Chemistry">Chemistry</MenuItem>
    <MenuItem value="Computer">Computer</MenuItem>
    <MenuItem value="Mechanical">Mechanical</MenuItem>
  </TextField>

  {/* Add Button */}
  {(isSystemAdmin() || isInstituteAdmin()) && (
    <Button
        variant="contained"
        onClick={() => handleOpenDialog()}
    >
        Add Equipment
    </Button>
)}

</Box>
      <TableContainer component={Paper}>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Image</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Category</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Laboratory</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Cost</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Quantity</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Available</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Status</b></TableCell>
              <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}><b>Actions</b></TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filteredEquipment.map((item) => (

              <TableRow
                  key={item.equipmentId}
                  hover
                  sx={{
                    transition: "0.2s",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      cursor: "pointer",
                    },
                  }}
                >

               <TableCell>
                    <img
                    src={`${IMAGE_BASE_URL}${item.image}`}
                    alt={item.equipmentName}
                    width={70}
                    height={70}
                    style={{
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      transition: "0.3s",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.08)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onError={(e) => {
                      console.log("Failed Image:", item.image);
                    }}
                  />
                  </TableCell>
                  

                <TableCell>{item.equipmentName}</TableCell>

                <TableCell>{item.category}</TableCell>

                <TableCell>
                  {item.laboratory?.labName}
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>
                  ₹{Number(item.cost).toLocaleString("en-IN")}
                </TableCell>

                <TableCell>
                  {item.quantity}
                </TableCell>

                <TableCell>
                  {item.availableQuantity}
                </TableCell>

                <TableCell>
                    <Chip
                      label={item.status}
                      color={
                        item.status === "Available"
                          ? "success"
                          : item.status === "In Use"
                          ? "warning"
                          : "error"
                      }
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        width: 110,
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                      }}
                    />
                  </TableCell>

                <TableCell>

                      <Tooltip title="Edit Equipment">

                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <EditIcon />
                        </IconButton>

                      </Tooltip>

                      <Tooltip title="Delete Equipment">

                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(item)}
                        >
                          <DeleteIcon />
                        </IconButton>

                      </Tooltip>

                    </TableCell>
              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>
          <EquipmentDialog
            open={openDialog}
            handleClose={handleCloseDialog}
            handleSave={handleSaveEquipment}
            equipment={selectedEquipment}
          />
          <Dialog
  open={deleteDialogOpen}
  onClose={handleCloseDeleteDialog}
>
  <DialogTitle>
    Delete Equipment
  </DialogTitle>

  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete
      <strong> {equipmentToDelete?.equipmentName}</strong> ?
    </DialogContentText>
  </DialogContent>

  <DialogActions>

    <Button
      onClick={handleCloseDeleteDialog}
    >
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={handleDeleteEquipment}
    >
      Delete
    </Button>

  </DialogActions>

</Dialog>
    </>
  );
}

export default Equipment;