import { useEffect, useState } from "react";
import userService from "../../services/userService";
import { MenuItem } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";

function NotificationDialog({
  open,
  handleClose,
  handleSave,
  notification,
}) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    notificationId: null,
    userId: "",
    title: "",
    message: "",
    type: "",
  });

  useEffect(() => {

    if (notification) {

      setFormData({
        notificationId: notification.notificationId,
        userId: notification.user?.userId || "",
        title: notification.title,
        message: notification.message,
        type: notification.type || "",
      });

    } else {

      setFormData({
        notificationId: null,
        userId: "",
        title: "",
        message: "",
        type: "",
      });

    }

  }, [notification]);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

  };

  useEffect(() => {
    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    loadUsers();
}, []);

  return (

    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >

      <DialogTitle>

        {notification ? "Edit Notification" : "New Notification"}

      </DialogTitle>

      <DialogContent>

        <Stack spacing={2} mt={2}>

          <TextField
    fullWidth
    select
    label="User"
    name="userId"
    value={formData.userId}
    onChange={handleChange}
>
    {users.map(user => (
        <MenuItem
            key={user.userId}
            value={user.userId}
        >
            {user.fullName}
        </MenuItem>
    ))}
</TextField>

<TextField
    fullWidth
    select
    label="Type"
    name="type"
    value={formData.type}
    onChange={handleChange}
>
    <MenuItem value="BOOKING">Booking</MenuItem>
    <MenuItem value="CERTIFICATION">Certification</MenuItem>
    <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
    <MenuItem value="SHARING">Sharing</MenuItem>
    <MenuItem value="IDLE_EQUIPMENT">Idle Equipment</MenuItem>
    <MenuItem value="REPORT">Report</MenuItem>
</TextField>

          <TextField
            fullWidth
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            name="message"
            value={formData.message}
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
          Save
        </Button>

      </DialogActions>

    </Dialog>

  );

}

export default NotificationDialog;