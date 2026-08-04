import { useEffect, useState } from "react";

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

  const [formData, setFormData] = useState({
    notificationId: null,
    userId: "",
    title: "",
    message: "",
  });

  useEffect(() => {

    if (notification) {

      setFormData({
        notificationId: notification.notificationId,
        userId: notification.user?.userId || "",
        title: notification.title,
        message: notification.message,
      });

    } else {

      setFormData({
        notificationId: null,
        userId: "",
        title: "",
        message: "",
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
            label="User ID"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
          />

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