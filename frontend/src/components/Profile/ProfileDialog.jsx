import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import userService from "../../services/userService";
import Snackbar from "@mui/material/Snackbar";
import ChangePasswordDialog from "./ChangePasswordDialog";
import Alert from "@mui/material/Alert";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Stack,
} from "@mui/material";

function ProfileDialog({ open, handleClose, user, setUser, showSnackbar}) {
    const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {

        if (user) {

            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                department: user.department || "",
            });
            setEditMode(false);
        }

    }, [user]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    try {

        const updatedUser =
            await userService.updateProfile(formData);

        setUser(updatedUser);

        setSnackbarMessage("Profile updated successfully");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        setEditMode(false);

    } catch (error) {

        console.error(error);

        setSnackbarMessage("Failed to update profile");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
    }
};

  return (

    <>
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>
        My Profile
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Stack spacing={2}>
          {editMode ? (
    <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={formData.fullName}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        fullName: e.target.value,
                    })
                }
            />
        ) : (
            <Typography>
                <strong>👤 Name:</strong> {user.fullName}
            </Typography>
        )}
         
            {editMode ? (
        <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) =>
                setFormData({
                    ...formData,
                    email: e.target.value,
                })
            }
        />
    ) : (
        <Typography>
            <strong>✉ Email:</strong> {user.email}
        </Typography>
    )}
          {editMode ? (
            <TextField
                label="Phone"
                fullWidth
                margin="normal"
                value={formData.phone}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        phone: e.target.value,
                    })
                }
            />
        ) : (
            <Typography>
                <strong>📱 Phone:</strong> {user.phone}
            </Typography>
        )}

{editMode ? (
    <TextField
        label="Department"
        fullWidth
        margin="normal"
        value={formData.department}
        onChange={(e) =>
            setFormData({
                ...formData,
                department: e.target.value,
            })
        }
    />
) : (
    <Typography>
        <strong>🏬 Department:</strong> {user.department}
    </Typography>
)}

          <Typography>
            <strong>🏢 Institution:</strong> {user.institutionName}
          </Typography>

          <Typography>
           <strong>💼 Role:</strong> {user.role}
          </Typography>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
    sx={{
        justifyContent: "space-between",
        px: 3,
        py: 2,
    }}
>
    {!editMode ? (
        <>
            <Button
                variant="contained"
                onClick={() => setEditMode(true)}
            >
                Edit Profile
            </Button>

            <Button
                variant="contained"
                onClick={() => setPasswordDialogOpen(true)}
            >
                Change Password
            </Button>

            <Button
                variant="contained"
                onClick={handleClose}
            >
                Close
            </Button>
        </>
    ) : (
        <>
            <Button
                variant="contained"
                color="success"
                onClick={handleSaveProfile}
            >
                Save Changes
            </Button>

            <Button
                variant="outlined"
                color="error"
                onClick={() => setEditMode(false)}
            >
                Cancel
            </Button>
        </>
    )}
</DialogActions>
<Snackbar
    open={snackbarOpen}
    autoHideDuration={3000}
    onClose={() => setSnackbarOpen(false)}
>
    <Alert
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
        variant="filled"
        sx={{ width: "100%" }}
    >
        {snackbarMessage}
    </Alert>
</Snackbar>


    </Dialog>
    <ChangePasswordDialog
      open={passwordDialogOpen}
      handleClose={() => setPasswordDialogOpen(false)}
      onSuccess={(message) => {
        showSnackbar(message, "success");
      }}
    />
    </>
  );
}

export default ProfileDialog;