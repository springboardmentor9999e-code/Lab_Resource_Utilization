import { useState, useEffect } from "react";
import laboratoryService from "../../services/laboratoryService";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";

function EquipmentDialog(props) {

  const {
    open,
    handleClose,
    handleSave,
    equipment,
  } = props;


   const [formData, setFormData] = useState({
    equipmentName: "",
    category: "",
    labId: "",
    cost: "",
    quantity: "",
    availableQuantity: "",
    status: "Available",
    image: "",
    description: "",
});

const [laboratories, setLaboratories] = useState([]);

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

useEffect(() => {
  loadLaboratories();
}, []);

const loadLaboratories = async () => {
  try {
    const data = await laboratoryService.getAllLaboratories();
    setLaboratories(data);
  } catch (error) {
    console.error("Failed to load laboratories", error);
  }
};

useEffect(() => {

  if (equipment) {

    setFormData({
        equipmentId: equipment.equipmentId,
        equipmentName: equipment.equipmentName || "",
        category: equipment.category || "",
        labId: equipment.laboratory?.labId || "",
        cost: equipment.cost || "",
        quantity: equipment.quantity || "",
        availableQuantity: equipment.availableQuantity || "",
        status: equipment.status || "Available",
        image: equipment.image || "",
        description: equipment.description || "",
      });

  } else {

    setFormData({
      equipmentId: null,
      equipmentName: "",
      category: "",
      labId: "",
      cost: "",
      quantity: "",
      availableQuantity: "",
      status: "Available",
      image: "",
      description: "",
    });
  }

}, [equipment]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Add Equipment</DialogTitle>

      <DialogContent>

        <Grid container spacing={2} sx={{ mt: 1 }}>

          <Grid item xs={12} md={6}>
            <TextField
                label="Equipment Name"
                name="equipmentName"
                value={formData.equipmentName}
                onChange={handleChange}
                fullWidth
                />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                fullWidth
                />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Laboratory"
              name="labId"
              value={formData.labId}
              onChange={handleChange}
              fullWidth
            >
              {laboratories.map((lab) => (
                <MenuItem
                  key={lab.labId}
                  value={lab.labId}
                >
                  {lab.labName}
                </MenuItem>
              ))}
            </TextField>
           </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                label="Cost"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                fullWidth
                />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                fullWidth
                />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                label="Available Quantity"
                name="availableQuantity"
                type="number"
                value={formData.availableQuantity}
                onChange={handleChange}
                fullWidth
                />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    fullWidth
                    >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="In Use">In Use</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
                label="Image File Name"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                placeholder="dell-desktop.jpg"
                />
          </Grid>

          <Grid item xs={12}>
            <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                />
          </Grid>

        </Grid>

      </DialogContent>

      <DialogActions>

        <Button
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
  variant="contained"
  onClick={() => {
    console.log("Save button clicked");
    console.log(formData);
    handleSave(formData);
  }}
>
  Save
</Button>

      </DialogActions>

    </Dialog>
  );
}


export default EquipmentDialog;