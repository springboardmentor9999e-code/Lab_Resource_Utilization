import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Divider,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";

import userService from "../../services/userService";

function ChangePasswordDialog({ open, handleClose, onSuccess }) {

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {

    setError("");

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Please fill all password fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    try {

      await userService.changePassword(formData);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      handleClose();

      if (onSuccess) {
        onSuccess("Password changed successfully.");
      }

    } catch (error) {

      console.error("Change password error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to change password."
      );
    }
  };

  return (
    
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >

      <DialogTitle sx={{ fontWeight: "bold" }}>
        Change Password
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>

        <Stack spacing={2}>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
  fullWidth
  type={showCurrentPassword ? "text" : "password"}
  label="Current Password"
  name="currentPassword"
  value={formData.currentPassword}
  onChange={handleChange}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            type="button"
            onClick={() =>
              setShowCurrentPassword((prev) => !prev)
            }
            edge="end"
            aria-label="toggle current password visibility"
          >
            {showCurrentPassword ? (
              <VisibilityOff />
            ) : (
              <Visibility />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

          <TextField
  fullWidth
  type={showNewPassword ? "text" : "password"}
  label="New Password"
  name="newPassword"
  value={formData.newPassword}
  onChange={handleChange}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            type="button"
            onClick={() =>
              setShowNewPassword((prev) => !prev)
            }
            edge="end"
            aria-label="toggle new password visibility"
          >
            {showNewPassword ? (
              <VisibilityOff />
            ) : (
              <Visibility />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

          <TextField
  fullWidth
  type={showConfirmPassword ? "text" : "password"}
  label="Confirm New Password"
  name="confirmPassword"
  value={formData.confirmPassword}
  onChange={handleChange}
  slotProps={{
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            type="button"
            onClick={() =>
              setShowConfirmPassword((prev) => !prev)
            }
            edge="end"
            aria-label="toggle confirm password visibility"
          >
            {showConfirmPassword ? (
              <VisibilityOff />
            ) : (
              <Visibility />
            )}
          </IconButton>
        </InputAdornment>
      ),
    },
  }}
/>

        </Stack>

      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>

        <Button
          variant="outlined"
          color="error"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
        >
          Change Password
        </Button>

      </DialogActions>

    </Dialog>
  );
}

export default ChangePasswordDialog;