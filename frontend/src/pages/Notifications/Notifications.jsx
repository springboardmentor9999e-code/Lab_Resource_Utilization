import { useEffect, useState } from "react";
import notificationService from "../../services/notificationService";
import NotificationDialog from "./NotificationDialog";

import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
const [selectedDeleteId, setSelectedDeleteId] = useState(null);

const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success",
});

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
  try {

    const userId = localStorage.getItem("userId");

    const data =
      await notificationService.getNotificationsByUser(userId);

    setNotifications(data);

  } catch (error) {
    console.error(error);
  }
};

  const handleOpenDialog = (notification = null) => {

    setSelectedNotification(notification);
    setOpenDialog(true);

  };

  const handleCloseDialog = () => {

    setSelectedNotification(null);
    setOpenDialog(false);

  };

  const handleSaveNotification = async (notification) => {

    try {

      const request = {
    user: {
        userId: notification.userId
    },
    title: notification.title,
    message: notification.message,
    type: notification.type
};

      if (notification.notificationId) {

        await notificationService.updateNotification(
          notification.notificationId,
          request
        );

      } else {

        await notificationService.createNotification(request);

      }

      loadNotifications();
      setSnackbar({
            open: true,
            message: notification.notificationId
                ? "Notification updated successfully!"
                : "Notification created successfully!",
            severity: "success",
        });
      handleCloseDialog();

    } catch (error) {

      console.error(error);

    }

  };

  const handleRead = async (id) => {

    try {

      await notificationService.markAsRead(id);
      loadNotifications();
      setSnackbar({
          open: true,
          message: "Marked as Read",
          severity: "success",
      });

    } catch (error) {

      console.error(error);

    }

  };

const handleDelete = (id) => {
    setSelectedDeleteId(id);
    setDeleteDialog(true);
};

const confirmDelete = async () => {
    try {

        await notificationService.deleteNotification(selectedDeleteId);

        loadNotifications();

        setSnackbar({
            open: true,
            message: "Notification deleted successfully!",
            severity: "success",
        });

    } catch (error) {

        setSnackbar({
            open: true,
            message: "Delete failed!",
            severity: "error",
        });

    }

    setDeleteDialog(false);
};

  const filteredNotifications = notifications.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleMarkAllRead = async () => {

    try {

        const userId = localStorage.getItem("userId");

        await notificationService.markAllAsRead(userId);

        loadNotifications();

        setSnackbar({
            open: true,
            message: "All notifications marked as read",
            severity: "success",
        });

    } catch (error) {

        console.error(error);

    }

};

const handleDeleteRead = async () => {

    try {

        const userId = localStorage.getItem("userId");

        await notificationService.deleteAllRead(userId);

        loadNotifications();

        setSnackbar({
            open: true,
            message: "All read notifications deleted",
            severity: "success",
        });

    } catch (error) {

        console.error(error);

    }

};

  return (
    <>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Notifications
      </Typography>

      <Box
          sx={{
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          <Card
            sx={{
              flex: "1 1 300px",
              borderRadius: 4,
              boxShadow: 3,
              transition: ".3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="text.secondary">
                Total Notifications
              </Typography>

              <Typography
                variant="h2"
                color="primary"
                fontWeight="bold"
              >
                {notifications.length}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: "1 1 300px",
              borderRadius: 4,
              boxShadow: 3,
              transition: ".3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="text.secondary">
                Unread
              </Typography>

              <Typography
                variant="h2"
                color="warning.main"
                fontWeight="bold"
              >
                {notifications.filter(n => !n.isRead).length}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: "1 1 300px",
              borderRadius: 4,
              boxShadow: 3,
              transition: ".3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography color="text.secondary">
                Read
              </Typography>

              <Typography
                variant="h2"
                color="success.main"
                fontWeight="bold"
              >
                {notifications.filter(n => n.isRead).length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

      <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3}
        >

        <TextField
          label="Search Notification"
          placeholder="Enter title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 380,
            maxWidth: "100%",
          }}
        />

        <Button
            variant="contained"
            color="success"
            onClick={handleMarkAllRead}
        >
            Mark All Read
        </Button>

        <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRead}
        >
            Delete Read
        </Button>

        {localStorage.getItem("role") !== "STUDENT" && (
        <Button
          variant="contained"
          size="large"
          onClick={() => handleOpenDialog()}
          sx={{
            px: 4,
            borderRadius: 3,
          }}
        >
          New Notification
        </Button>
        )}
      </Box>

      <TableContainer
            component={Paper}
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              //overflow: "hidden",
            }}
          >

        <Table>

          <TableHead
              sx={{
                backgroundColor: "#1976d2",
                "& .MuiTableCell-root": {
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "15px",
                },
              }}
            >

            <TableRow>

              <TableCell><b>User</b></TableCell>
              <TableCell><b>Title</b></TableCell>
              <TableCell><b>Message</b></TableCell>
              <TableCell><b>Type</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Date</b></TableCell>
              <TableCell><b>Actions</b></TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filteredNotifications.map((item) => (

              <TableRow key={item.notificationId}>

                <TableCell>
                  {item.user?.fullName}
                </TableCell>

                <TableCell>
                  {item.title}
                </TableCell>

                <TableCell>
                  {item.message}
                </TableCell>

                <TableCell>
                    <Chip
                        label={item.type}
                        color="primary"
                        variant="outlined"
                    />
                </TableCell>

                <TableCell>

                  <Chip
                  label={item.isRead ? "Read" : "Unread"}
                  color={item.isRead ? "success" : "warning"}
                  sx={{
                    fontWeight: "bold",
                    px: 1,
                  }}
                />

                </TableCell>

                <TableCell>
                  {item.createdAt?.substring(0, 10)}
                </TableCell>

                <TableCell>
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={1}
                      alignItems="center"
                    >

                      {!item.isRead && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleRead(item.notificationId)}
                          sx={{
                            width: 110,
                            borderRadius: 2,
                          }}
                        >
                          Read
                        </Button>
                      )}

                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        disabled={item.isRead}
                        onClick={() => handleOpenDialog(item)}
                        sx={{
                          width: 110,
                          borderRadius: 2,
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(item.notificationId)}
                        sx={{
                          width: 110,
                          borderRadius: 2,
                        }}
                      >
                        Delete
                      </Button>

                    </Box>
                  </TableCell>
              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>

      <Dialog
              open={deleteDialog}
              onClose={() => setDeleteDialog(false)}
          >
              <DialogTitle>
                  Delete Notification
              </DialogTitle>

              <DialogContent>
                  <DialogContentText>
                      Are you sure you want to delete this notification?
                  </DialogContentText>
              </DialogContent>

              <DialogActions>

                  <Button
                      onClick={() => setDeleteDialog(false)}
                  >
                      Cancel
                  </Button>

                  <Button
                      color="error"
                      variant="contained"
                      onClick={confirmDelete}
                  >
                      Delete
                  </Button>

              </DialogActions>

          </Dialog>

      <NotificationDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        handleSave={handleSaveNotification}
        notification={selectedNotification}
      />
      <Snackbar
    open={snackbar.open}
    autoHideDuration={3000}
    onClose={() =>
        setSnackbar({
            ...snackbar,
            open: false,
        })
    }
    anchorOrigin={{
        vertical: "top",
        horizontal: "right",
    }}
>
    <Alert
        onClose={() =>
            setSnackbar({
                ...snackbar,
                open: false,
            })
        }
        severity={snackbar.severity}
        variant="filled"
        sx={{
            width: "100%",
            borderRadius: 2,
        }}
    >
        {snackbar.message}
    </Alert>
</Snackbar>
    </>
  );

}

export default Notifications;