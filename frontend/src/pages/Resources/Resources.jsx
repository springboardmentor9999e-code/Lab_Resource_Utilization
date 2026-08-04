import { useEffect, useState } from "react";
import resourceService from "../../services/resourceService";
import ResourceDialog from "./ResourceDialog";

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
} from "@mui/material";

function Resources() {

  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error(error);

        setSnackbar({
          open: true,
          message: "Operation failed!",
          severity: "error",
        });
    }
  };

  const handleOpenDialog = (resource = null) => {
    setSelectedResource(resource);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedResource(null);
    setOpenDialog(false);
  };

  const handleSaveResource = async (resource) => {

    try {

      if (resource.resourceId) {

        await resourceService.updateResource(
          resource.resourceId,
          resource
        );

      } else {

        await resourceService.createResource(resource);

      }

              loadResources();
        handleCloseDialog();

        setSnackbar({
          open: true,
          message: resource.resourceId
            ? "Resource updated successfully!"
            : "Resource added successfully!",
          severity: "success",
        });

    } catch (error) {

      console.error(error);

      setSnackbar({
        open: true,
        message: "Operation failed!",
        severity: "error",
      });

    }

  };

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this resource?")) return;

    try {

      await resourceService.deleteResource(id);

      loadResources();
      setSnackbar({
            open: true,
            message: "Resource deleted successfully!",
            severity: "success",
          });

    } catch (error) {

      console.error(error);

        setSnackbar({
          open: true,
          message: "Operation failed!",
          severity: "error",
        });

    }

  };

  const filteredResources = resources.filter(resource =>
    resource.resourceName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Resource Management
      </Typography>

      <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 3,
            mb: 4,
          }}
        >
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">
              Total Resources
            </Typography>

            <Typography
              variant="h2"
              color="primary"
              fontWeight="bold"
            >
              {resources.length}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">
              Available
            </Typography>

            <Typography
              variant="h2"
              color="success.main"
              fontWeight="bold"
            >
              {resources.filter(r => r.status === "Available").length}
            </Typography>
          </CardContent>
        </Card>

          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="subtitle2">
                Unavailable
              </Typography>

              <Typography
                variant="h2"
                color="error.main"
                fontWeight="bold"
              >
                {resources.filter(r => r.status !== "Available").length}
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
            placeholder="Search Resource"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: 320,
              bgcolor: "#fff",
            }}
          />

        <Button
            variant="contained"
            size="large"
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 6,
            }}
          >
            Add Resource
          </Button>

      </Box>

      <TableContainer component={Paper}>

        <Table>

          <TableHead
              sx={{
                bgcolor: "#1976d2",
              }}
            >

            <TableRow>

              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Name</b></TableCell>
              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Type</b></TableCell>
              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Description</b></TableCell>
              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Quantity</b></TableCell>
              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Status</b></TableCell>
              <TableCell sx={{ color: "white",fontWeight: "bold",}}><b>Actions</b></TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filteredResources.map((resource) => (

              <TableRow key={resource.resourceId} hover >

                <TableCell>{resource.resourceName}</TableCell>

                <TableCell>{resource.resourceType}</TableCell>

                <TableCell>{resource.description}</TableCell>

                <TableCell>{resource.quantity}</TableCell>

                <TableCell>

                  <Chip
                    label={resource.status}
                    color={
                      resource.status === "Available"
                        ? "success"
                        : "error"
                    }
                  />

                </TableCell>

                <TableCell>

                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDialog(resource)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(resource.resourceId)}
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

      <ResourceDialog
        open={openDialog}
        handleClose={handleCloseDialog}
        handleSave={handleSaveResource}
        resource={selectedResource}
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
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );

}

export default Resources;