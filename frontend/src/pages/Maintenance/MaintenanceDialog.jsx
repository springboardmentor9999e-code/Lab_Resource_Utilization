import { useEffect, useState } from "react";
import equipmentService from "../../services/equipmentService";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  Stack,
} from "@mui/material";

function MaintenanceDialog({
  open,
  handleClose,
  handleSave,
}) {

  const [equipment, setEquipment] = useState([]);

  const [formData, setFormData] = useState({
    equipmentId: "",
    issueDescription: ""
  });

  useEffect(() => {

    loadEquipment();

  }, []);

  const loadEquipment = async () => {

    try {

      const data = await equipmentService.getAllEquipment();

      setEquipment(data);

    } catch (error) {

      console.error(error);

    }

  };

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
      fullWidth
      maxWidth="sm"
    >

      <DialogTitle>
        Report Maintenance Issue
      </DialogTitle>

      <DialogContent>

        <Stack spacing={2} mt={2}>

          <TextField
            select
            fullWidth
            label="Equipment"
            name="equipmentId"
            value={formData.equipmentId}
            onChange={handleChange}
          >

            {equipment.map((item) => (

              <MenuItem
                key={item.equipmentId}
                value={item.equipmentId}
              >
                {item.equipmentName}
              </MenuItem>

            ))}

          </TextField>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Issue Description"
            name="issueDescription"
            value={formData.issueDescription}
            onChange={handleChange}
          />

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
          Submit
        </Button>

      </DialogActions>

    </Dialog>

  );

}

export default MaintenanceDialog;