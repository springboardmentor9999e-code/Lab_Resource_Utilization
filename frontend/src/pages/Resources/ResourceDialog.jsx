import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";

function ResourceDialog({
  open,
  handleClose,
  handleSave,
  resource,
}) {

  const [formData, setFormData] = useState({
    resourceId: null,
    resourceName: "",
    resourceType: "",
    description: "",
    quantity: "",
    status: "Available",
  });

  useEffect(() => {

    if (resource) {

      setFormData(resource);

    } else {

      setFormData({
        resourceId: null,
        resourceName: "",
        resourceType: "",
        description: "",
        quantity: "",
        status: "Available",
      });

    }

  }, [resource]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

  };

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >

      <DialogTitle>

        {resource ? "Edit Resource" : "Add Resource"}

      </DialogTitle>

      <DialogContent>

        <Stack spacing={2} mt={2}>

          <TextField
            fullWidth
            label="Resource Name"
            name="resourceName"
            value={formData.resourceName}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            label="Resource Type"
            name="resourceType"
            value={formData.resourceType}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            type="number"
            label="Quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
          />

          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >

            <MenuItem value="Available">
              Available
            </MenuItem>

            <MenuItem value="Unavailable">
              Unavailable
            </MenuItem>

          </TextField>

        </Stack>

      </DialogContent>

      <DialogActions>

        <Button onClick={handleClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => handleSave(formData)}
        >
          Save
        </Button>

      </DialogActions>

    </Dialog>

  );

}

export default ResourceDialog;