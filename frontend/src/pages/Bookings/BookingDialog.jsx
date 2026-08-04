import { useEffect, useState } from "react";
import institutionService from "../../services/institutionService";
import laboratoryService from "../../services/laboratoryService";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import equipmentService from "../../services/equipmentService";
import dayjs from "dayjs";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";

function BookingDialog({
  open,
  handleClose,
  handleSave,
  booking,
}) 
{

  const [laboratories, setLaboratories] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [institutions, setInstitutions] = useState([]);
  const [formData, setFormData] = useState({
            bookingId: null,
            institutionId: "",
            labId: "",
            equipmentId: "",
            quantity: 1,
            bookingDate: "",
            startTime: "",
            endTime: "",
            purpose: "",

            status: "PENDING",
        });

useEffect(() => {
    loadInstitutions();
}, []);


  useEffect(() => {

    if (booking) {

        setFormData({
            bookingId: booking.bookingId,
            institutionId:
                booking.laboratory?.institution?.institutionId || "",
            labId: booking.laboratory?.labId || "",
            equipmentId: booking.equipment?.equipmentId || "",
            quantity: booking.quantity || 1,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            purpose: booking.purpose,
            status: booking.status,
        });

        loadEquipment(booking.laboratory?.labId);

    } else {

        setFormData({
            bookingId: null,
            institutionId: "",
            labId: "",
            equipmentId: "",
            quantity: 1,
            bookingDate: "",
            startTime: "",
            endTime: "",
            purpose: "",
            status: "PENDING",
        });

        setEquipment([]);

    }

}, [booking]);
  
const loadLaboratories = async () => {

    try {

      const data = await laboratoryService.getAllLaboratories();

      setLaboratories(data);

    } catch (error) {

      console.error(error);

    }

  };

  const loadInstitutions = async () => {

    try {

        const data = await institutionService.getAllInstitutions();

        setInstitutions(data);

    } catch (error) {

        console.error(error);

    }

};

  const loadEquipment = async (labId) => {

    if (!labId) {
        setEquipment([]);
        return;
    }

    try {

        const data =
            await equipmentService.getEquipmentByLab(labId);

        setEquipment(data);

    } catch (error) {

        console.error(error);

    }

};

  const handleChange = async (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
        ...prev,
        [name]: value,
    }));

    if (name === "institutionId") {

    const labs =
        await laboratoryService.getLaboratoriesByInstitution(value);

    setLaboratories(labs);

    setFormData(prev => ({
            ...prev,
            institutionId: value,
            labId: "",
            equipmentId: ""
        }));

    setEquipment([]);

    return;
}

    if (name === "labId") {

            setFormData(prev => ({
                ...prev,
                labId: value,
                equipmentId: ""
            }));

            loadEquipment(value);

            return;
        }

};

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >

      <DialogTitle>

        {booking ? "Edit Booking" : "New Booking"}

      </DialogTitle>

            <DialogContent>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={2} sx={{ mt: 2 }}>

                <TextField
                    select
                    fullWidth
                    label="Institution"
                    name="institutionId"
                    value={formData.institutionId}
                    onChange={handleChange}
                >

                    {institutions.map((institution) => (

                        <MenuItem
                            key={institution.institutionId}
                            value={institution.institutionId}
                        >
                            {institution.institutionName}
                        </MenuItem>

                    ))}

                </TextField>
                <TextField
                select
                fullWidth
                label="Laboratory"
                name="labId"
                value={formData.labId}
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
                            {item.equipmentName} ({item.availableQuantity} Available)
                        </MenuItem>

                    ))}
                </TextField>

                <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    inputProps={{
                        min: 1,
                    }}
                />
                    <DatePicker
                    label="Booking Date"
                    value={formData.bookingDate ? dayjs(formData.bookingDate) : null}
                    onChange={(newValue) =>
                        setFormData({
                        ...formData,
                        bookingDate: newValue
                            ? newValue.format("YYYY-MM-DD")
                            : "",
                        })
                    }
                    slotProps={{
                        textField: {
                        fullWidth: true,
                        },
                    }}
                    />

                <Box
                sx={{
                    display: "flex",
                    gap: 2,
                }}
                >
                <TimePicker
                    label="Start Time"
                    value={
                        formData.startTime
                        ? dayjs(`2026-01-01T${formData.startTime}`)
                        : null
                    }
                    onChange={(newValue) =>
                        setFormData({
                        ...formData,
                        startTime: newValue
                            ? newValue.format("HH:mm:ss")
                            : "",
                        })
                    }
                    slotProps={{
                        textField: {
                        fullWidth: true,
                        },
                    }}
                    />

                <TimePicker
                    label="End Time"
                    value={
                        formData.endTime
                        ? dayjs(`2026-01-01T${formData.endTime}`)
                        : null
                    }
                    onChange={(newValue) =>
                        setFormData({
                        ...formData,
                        endTime: newValue
                            ? newValue.format("HH:mm:ss")
                            : "",
                        })
                    }
                    slotProps={{
                        textField: {
                        fullWidth: true,
                        },
                    }}
                    />

                </Box>

                <TextField
                fullWidth
                multiline
                rows={3}
                label="Purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                />
    
            </Stack>
                </LocalizationProvider>
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
export default BookingDialog;