import { useEffect, useState } from "react";

import institutionService from "../../services/institutionService";
import laboratoryService from "../../services/laboratoryService";
import equipmentService from "../../services/equipmentService";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

function SharingDialog({
  open,
  onClose,
  onSave,
  sharing,
}) {

  const [institutions, setInstitutions] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [formData, setFormData] = useState({
    sharingId: null,
    resourceType: "LABORATORY",
    laboratoryId: "",
    equipmentId: "",
    fromInstitutionId: "",
    toInstitutionId: "",
    sharedQuantity: "",
    availableFrom: "",
    availableTo: "",
    remarks: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (sharing) {
      setFormData({
        sharingId: sharing.sharingId,
        resourceType: sharing.resourceType,
        laboratoryId: sharing.laboratory?.labId || "",
        equipmentId: sharing.equipment?.equipmentId || "",
        fromInstitutionId: sharing.fromInstitution?.institutionId || "",
        toInstitutionId: sharing.toInstitution?.institutionId || "",
        sharedQuantity: sharing.sharedQuantity,
        availableFrom: sharing.availableFrom,
        availableTo: sharing.availableTo,
        //status: sharing.status,
        remarks: sharing.remarks,
      });
    } else {
      setFormData({
        sharingId: null,
        resourceType: "LABORATORY",
        laboratoryId: "",
        equipmentId: "",
        fromInstitutionId: "",
        toInstitutionId: "",
        sharedQuantity: "",
        availableFrom: "",
        availableTo: "",
        //status: "AVAILABLE",
        remarks: "",
      });
    }
  }, [sharing]);

  const loadData = async () => {
    try {
      const inst = await institutionService.getAllInstitutions();
      const labs = await laboratoryService.getAllLaboratories();
      const equip = await equipmentService.getAllEquipment();

      setInstitutions(inst);
      setLaboratories(labs);
      setEquipment(equip);
    } catch (err) {
      console.error(err);
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
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {sharing ? "Edit Sharing" : "Add Sharing"}
      </DialogTitle>

      <DialogContent>

        <Stack spacing={2} mt={2}>

          <TextField
            select
            label="Resource Type"
            name="resourceType"
            value={formData.resourceType}
            onChange={handleChange}
          >
            <MenuItem value="LABORATORY">Laboratory</MenuItem>
            <MenuItem value="EQUIPMENT">Equipment</MenuItem>
          </TextField>

          {formData.resourceType === "LABORATORY" && (
            <TextField
              select
              label="Laboratory"
              name="laboratoryId"
              value={formData.laboratoryId}
              onChange={handleChange}
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
          )}

          {formData.resourceType === "EQUIPMENT" && (
            <TextField
              select
              label="Equipment"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
            >
              {equipment.map((eq) => (
                <MenuItem
                  key={eq.equipmentId}
                  value={eq.equipmentId}
                >
                  {eq.equipmentName}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            label="From Institution"
            name="fromInstitutionId"
            value={formData.fromInstitutionId}
            onChange={handleChange}
          >
            {institutions.map((inst) => (
              <MenuItem
                key={inst.institutionId}
                value={inst.institutionId}
              >
                {inst.institutionName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="To Institution"
            name="toInstitutionId"
            value={formData.toInstitutionId}
            onChange={handleChange}
          >
            {institutions.map((inst) => (
              <MenuItem
                key={inst.institutionId}
                value={inst.institutionId}
              >
                {inst.institutionName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Shared Quantity"
            name="sharedQuantity"
            value={formData.sharedQuantity}
            onChange={handleChange}
          />

          <TextField
            type="date"
            label="Available From"
            name="availableFrom"
            value={formData.availableFrom}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            
          />

          <TextField
            type="date"
            label="Available To"
            name="availableTo"
            value={formData.availableTo}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          

          <TextField
            multiline
            rows={3}
            label="Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
          />

        </Stack>

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={() => onSave(formData)}
        >
          Save
        </Button>

      </DialogActions>

    </Dialog>
  );
}

export default SharingDialog;