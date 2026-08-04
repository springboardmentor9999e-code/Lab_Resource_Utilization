import { useEffect, useState } from "react";
import maintenanceService from "../../services/maintenanceService";
import MaintenanceDialog from "./MaintenanceDialog";
import { getRole } from "../../utils/roleUtils";

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

function Maintenance() {

  const [maintenanceList, setMaintenanceList] = useState([]);
  const [search, setSearch] = useState("");
  const role = getRole();
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
        open:false,
        message:"",
        severity:"success",
    });

  useEffect(() => {
    loadMaintenance();
  }, []);

  const loadMaintenance = async () => {
    try {
      const data = await maintenanceService.getAllMaintenance();
      setMaintenanceList(data);
    } catch (error) {
      console.error(error);

        setSnackbar({
            open:true,
            message:"Operation failed!",
            severity:"error",
        });

    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
};

const handleCloseDialog = () => {
    setOpenDialog(false);
};

const handleSaveMaintenance = async (data) => {

    try {

        const request = {
          equipmentId: data.equipmentId,
          reportedById: 4,
          issueDescription: data.issueDescription,
          status: "PENDING",
          reportedDate: new Date().toISOString().split("T")[0]
      };

        await maintenanceService.createMaintenance(request);

        loadMaintenance();

        handleCloseDialog();
        setSnackbar({
          open:true,
          message:"Issue reported successfully!",
          severity:"success",
      });

    } catch (error) {

        console.error(error);

        setSnackbar({
            open:true,
            message:"Operation failed!",
            severity:"error",
        });

    }

};

const handleResolve = async (item) => {

    try {

        const request = {
            equipmentId: item.equipment.equipmentId,
            reportedById: item.reportedBy.userId,
            issueDescription: item.issueDescription,
            status: "COMPLETED",
            reportedDate: item.reportedDate,
        };

        await maintenanceService.updateMaintenance(
            item.maintenanceId,
            request
        );

        loadMaintenance();

        setSnackbar({
            open: true,
            message: "Maintenance Completed Successfully!",
            severity: "success",
        });

    } catch (error) {

        console.error(error);

        setSnackbar({
            open: true,
            message: "Failed to update maintenance!",
            severity: "error",
        });

    }
};

  const filteredMaintenance = maintenanceList.filter((item) =>
    item.equipment?.equipmentName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>

      <Typography variant="h4" fontWeight="bold" mb={3}>
        Maintenance Management
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
          mb: 4,
        }}
      >

        <Card  sx={{borderRadius: 3,boxShadow: 3,}}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography >Total Issues</Typography>
            <Typography variant="h2" color="primary" fontWeight="bold">
              {maintenanceList.length}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{borderRadius: 3,boxShadow: 3,}}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Pending Issues</Typography>
            <Typography variant="h2" color="warning.main" fontWeight="bold">
              {
                maintenanceList.filter(
                   m => m.status === "PENDING"
                ).length
              }
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography>Resolved Issues</Typography>
            <Typography variant="h2" color="success.main" fontWeight="bold">
              {
                maintenanceList.filter(
                  m => m.status === "RESOLVED"
                ).length
              }
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
            placeholder="Search Equipment"
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            sx={{
                width:320,
                bgcolor:"#fff"
            }}
        />

        <Button
            variant="contained"
            size="large"
            onClick={handleOpenDialog}
            sx={{
                px:4,
                borderRadius:2,
            }}
        >
            Report Issue
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

              <TableCell  sx={{ color:"white",fontWeight:"bold" }}><b>Equipment</b></TableCell>
              <TableCell sx={{ color:"white",fontWeight:"bold" }}><b>Laboratory</b></TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}><b>Institution</b></TableCell>
              <TableCell sx={{ color:"white",fontWeight:"bold" }}><b>Reported By</b></TableCell>
              <TableCell sx={{ color:"white",fontWeight:"bold" }}><b>Issue</b></TableCell>
              <TableCell sx={{ color:"white",fontWeight:"bold" }}><b>Date</b></TableCell>
              <TableCell sx={{ color:"white",fontWeight:"bold" }}><b>Status</b></TableCell>
              {role === "LAB_ASSISTANT" && (
              <TableCell sx={{ color: "white", fontWeight: "bold" }}><b>Action</b></TableCell>
                )}

            </TableRow>

          </TableHead>

          <TableBody>

            {filteredMaintenance.map((item) => (

              <TableRow
                key={item.maintenanceId}
                hover
            >

                <TableCell>
                  {item.equipment?.equipmentName}
                </TableCell>

                <TableCell>
                  {item.equipment?.laboratory?.labName}
                </TableCell>

                <TableCell>
                    {item.equipment?.laboratory?.institution?.institutionName}
                </TableCell>

                <TableCell>
                  {item.reportedBy?.fullName}
                </TableCell>

                <TableCell>
                  {item.issueDescription}
                </TableCell>

                <TableCell>
                  {item.reportedDate}
                </TableCell>

                <TableCell>

                  <Chip
                    label={item.status}
                    color={
                          item.status === "RESOLVED"
                              ? "success"
                              : item.status === "PENDING"
                              ? "warning"
                              : "error"
                      }
                  />

                </TableCell>

                <TableCell>

                  {role === "LAB_ASSISTANT" && (
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleResolve(item)}
                          disabled={item.status === "RESOLVED"}
                        >
                          Resolve
                        </Button>
                      </TableCell>
                    )}

              </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </TableContainer>
           
         <MaintenanceDialog
            open={openDialog}
            handleClose={handleCloseDialog}
            handleSave={handleSaveMaintenance}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() =>
              setSnackbar({
                  ...snackbar,
                  open:false,
              })
          }
          anchorOrigin={{
              vertical:"top",
              horizontal:"right",
          }}
      >
          <Alert
              severity={snackbar.severity}
              variant="filled"
              sx={{ width:"100%" }}
          >
              {snackbar.message}
          </Alert>
      </Snackbar>
    </>
  );
}

export default Maintenance;