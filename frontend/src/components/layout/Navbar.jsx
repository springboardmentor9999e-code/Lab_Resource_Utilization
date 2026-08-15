import { useEffect, useState } from "react";

import NotificationsIcon from "@mui/icons-material/Notifications";
import ProfileDialog from "../Profile/ProfileDialog";
import notificationService from "../../services/notificationService";
import userService from "../../services/userService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Button
} from "@mui/material";


function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const userId = localStorage.getItem("userId");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
  if (!userId) return;

  loadNotifications();
  loadProfile();

}, []);

  const loadNotifications = async () => {

      try {

          const data =
              await notificationService.getNotificationsByUser(userId);

          setNotifications(data);

          setUnreadCount(
              data.filter(n => !n.isRead).length
          );

      } catch (error) {

          console.error(error);

      }

  };
    const handleBellClick = async (event) => {

    setAnchorEl(event.currentTarget);

    await loadNotifications();

};

const handleClose = () => {
  setAnchorEl(null);
};
const handleMarkAllRead = async () => {

    try {

        await notificationService.markAllAsRead(userId);

        loadNotifications();

    } catch (error) {

        console.error(error);

    }

};

const handleDeleteRead = async () => {

    try {

        await notificationService.deleteAllRead(userId);

        loadNotifications();

    } catch (error) {

        console.error(error);

    }

};

const loadProfile = async () => {
  try {
    const data = await userService.getProfile();
    setUser(data);
    console.log("PROFILE DATA =", data);
  } catch (error) {
    console.error(error);
  }
};

const initials = user?.fullName
  ? user.fullName
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
  : "U";

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
};

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        background: "#ffffff",
        color: "#333",
        width: "calc(100% - 240px)",
        ml: "240px",
        zIndex: 1100,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold" }}
        >
          Lab Resource Utilization Platform
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          onClick={handleBellClick}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Avatar
        sx={{
          bgcolor: "#2563EB",
          ml: 2,
          cursor: "pointer",
        }}
        onClick={() => setProfileOpen(true)}
      >
        {initials}
      </Avatar>

        <Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleClose}
  PaperProps={{
    sx: {
      width: 350,
    },
  }}
>
  <MenuItem
    sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    }}
>
    <strong>Recent Notifications</strong>


</MenuItem>

<Divider />

  {notifications.length === 0 ? (
    <MenuItem>No notifications</MenuItem>
  ) : (
    notifications.slice(0, 5).map((n) => (
      <MenuItem
        key={n.notificationId}
        sx={{
          whiteSpace: "normal",
          display: "block",
        }}
      >
        <strong>{n.title}</strong>

        <br />

        <small>{n.message}</small>
      </MenuItem>
    ))
  )}
</Menu>

<ProfileDialog
    open={profileOpen}
    handleClose={() => setProfileOpen(false)}
    user={user}
    setUser={setUser}
    showSnackbar={showSnackbar}
/>

<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "right",
  }}
>
  <Alert
    severity={snackbarSeverity}
    variant="filled"
    onClose={() => setSnackbarOpen(false)}
    sx={{ width: "100%" }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;