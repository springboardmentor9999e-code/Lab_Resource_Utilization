import { useEffect, useState } from "react";
import certificationService from "../../services/certificationService";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import equipmentService from "../../services/equipmentService";
import TablePagination from "@mui/material/TablePagination";
import { jsPDF } from "jspdf";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    TextField,
    Menu,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

function Certification() {

    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedCertification, setSelectedCertification] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedCert, setSelectedCert] = useState(null);
    const openMenu = Boolean(anchorEl);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editData, setEditData] = useState({});
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [equipmentList, setEquipmentList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const role = localStorage.getItem("role");
    const canAdd =
        role === "SYSTEM_ADMIN" ||
        role === "INSTITUTE_ADMIN" ||
        role === "DEPARTMENT_HEAD" ||
        role === "LAB_ASSISTANT";

    const canEdit =
        role === "SYSTEM_ADMIN" ||
        role === "INSTITUTE_ADMIN" ||
        role === "DEPARTMENT_HEAD" ||
        role === "LAB_ASSISTANT";

    const canDelete =
        role === "SYSTEM_ADMIN" ||
        role === "INSTITUTE_ADMIN";

    const canDownload =
        role !== "STUDENT";

    useEffect(() => {
        loadCertifications();
        loadEquipment();
        setPage(0);
    }, [search, status, fromDate, toDate]);

    const loadCertifications = async () => {

    try {

        let data = [];

        switch (role) {

    case "SYSTEM_ADMIN":
        data = await certificationService.getAll();
        break;

    case "INSTITUTE_ADMIN":
    case "DEPARTMENT_HEAD":
        data = await certificationService.getByInstitution();
        break;

    case "LAB_ASSISTANT":
    case "FACULTY":
    case "STUDENT":
        data = await certificationService.getByLab();
        break;

    default:
        data = [];
}

        setCertifications(data);

    } catch (err) {

        console.error(err);

    } finally {

        setLoading(false);

    }

};

    const valid = certifications.filter(
        c => c.status === "Valid"
    ).length;

    const expiring = certifications.filter(
        c => c.status === "Expiring Soon"
    ).length;

    const expired = certifications.filter(
        c => c.status === "Expired"
    ).length;

    const filteredCertifications = certifications.filter((cert) => {

    const equipment =
        cert.equipment?.equipmentName?.toLowerCase() || "";

    const matchesSearch =
        equipment.includes(search.toLowerCase());

    const matchesStatus =
        status === "" || cert.status === status;

    const matchesFrom =
        !fromDate || cert.calibrationDate >= fromDate;

    const matchesTo =
        !toDate || cert.expiryDate <= toDate;

    return (
        matchesSearch &&
        matchesStatus &&
        matchesFrom &&
        matchesTo
    );

});

const getDaysLeft = (expiryDate) => {
    const today = new Date();

    const expiry = new Date(expiryDate);

    const diff =
        Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    return diff;
};

const handleView = (cert) => {
    setSelectedCertification(cert);
    setOpenDialog(true);
};

const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCertification(null);
};

const handleMenuClick = (event, cert) => {

    setAnchorEl(event.currentTarget);

    setSelectedCert(cert);

};

const handleMenuClose = () => {

    setAnchorEl(null);

};

const handleDelete = async () => {

    if (!selectedCert) return;

    const confirmDelete = window.confirm(
        "Delete this certification?"
    );

    if (!confirmDelete) return;

    try {

        await certificationService.delete(selectedCert.certificationId);

        loadCertifications();

    } catch (err) {

        console.error(err);

    }

    handleMenuClose();

};

const handleEdit = () => {

    setEditData(selectedCert);

    setOpenEditDialog(true);

    handleMenuClose();

};

const handleSaveEdit = async () => {

    try {

        await certificationService.update(
            editData.certificationId,
            editData
        );

        loadCertifications();

        setOpenEditDialog(false);

    } catch (err) {

        console.error(err);

    }

};

const [newCertificate, setNewCertificate] = useState({
    equipment: {
        equipmentId: ""
    },
    certificateType: "",
    certificateNumber: "",
    issuedBy: "",
    issueDate: "",
    expiryDate: "",
    lastCalibrationDate: "",
    nextCalibrationDate: "",
    status: "Valid",
    remarks: ""
});

const loadEquipment = async () => {

    try {

        const data =
            await equipmentService.getAllEquipment();

        setEquipmentList(data);

    }

    catch (err) {

        console.error(err);

    }

};

const handleAddCertificate = async () => {

    try {

        await certificationService.create(newCertificate);

        loadCertifications();

        setOpenAddDialog(false);

    }

    catch (err) {

        console.error(err);

    }

};


const handleDownload = (cert) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Equipment Certificate", 20, 20);

    doc.setFontSize(12);
    doc.text(`Equipment: ${cert.equipment?.equipmentName}`, 20, 40);
    doc.text(`Certificate No: ${cert.certificateNumber}`, 20, 50);
    doc.text(`Type: ${cert.certificateType}`, 20, 60);
    doc.text(`Issued By: ${cert.issuedBy}`, 20, 70);
    doc.text(`Issue Date: ${cert.issueDate}`, 20, 80);
    doc.text(`Expiry Date: ${cert.expiryDate}`, 20, 90);
    doc.text(`Status: ${cert.status}`, 20, 100);
    doc.text(`Remarks: ${cert.remarks}`, 20, 110);

    doc.save(`${cert.certificateNumber}.pdf`);
};
    return (

        <Box
    sx={{
        width: "100%",
        minHeight: "100%",
    }}
>

            <Box
                sx={{
                    maxWidth: "1200px",
                    margin: "0 auto"
                }}
            >

            <Box
    display="flex"
    justifyContent="space-between"
    alignItems="center"
    mb={3}
>
    <Typography
        variant="h4"
        fontWeight="bold"
    >
        Equipment Certification
    </Typography>

    {canAdd && (
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
        >
            Add Certificate
        </Button>
    )}
</Box>
            

            <Grid container spacing={3} sx={{ mb: 4 }}>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography>Total Certificates</Typography>
                            <Typography variant="h4">
                                {certifications.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography>Valid</Typography>
                            <Typography
                                variant="h4"
                                color="green"
                            >
                                {valid}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography>Expiring Soon</Typography>
                            <Typography
                                variant="h4"
                                color="orange"
                            >
                                {expiring}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography>Expired</Typography>
                            <Typography
                                variant="h4"
                                color="red"
                            >
                                {expired}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>

            <Paper
    elevation={3}
    sx={{
        p:3,
        borderRadius:3,
        mb:4
    }}
>

<Grid container spacing={2.5} alignItems="center" sx={{ mb: 4 }}>

  <Grid size={{ xs: 12, md: 3.5 }}>
    <TextField
    fullWidth
    size="small"
    placeholder="Search Equipment..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    InputProps={{
        startAdornment: (
            <InputAdornment position="start">
                <SearchIcon />
            </InputAdornment>
        ),
    }}
/>
  </Grid>

  <Grid size={{ xs: 12, md: 2 }}>
    <FormControl fullWidth size="small">
      <InputLabel>Status</InputLabel>
      <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
        >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Valid">Valid</MenuItem>
        <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
        <MenuItem value="Expired">Expired</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  <Grid size={{ xs: 12, md: 2.5 }}>
    <TextField
    fullWidth
    size="small"
    label="From Date"
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    slotProps={{
        htmlInput: {
            style: {
                color: fromDate ? "inherit" : "transparent",
            },
        },
    }}
/>
</Grid>

<Grid size={{ xs: 12, md: 2.5 }}>
    <TextField
    fullWidth
    size="small"
    label="To Date"
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    InputLabelProps={{ shrink: true }}
    slotProps={{
        htmlInput: {
            style: {
                color: toDate ? "inherit" : "transparent",
            },
        },
    }}
/>
</Grid>

  <Grid
    size={{ xs: 12, md: 2.5 }}
    sx={{
      display: "flex",
      gap: 1
    }}
  >
    <Button
      variant="contained"
      fullWidth
    >
      Filter
    </Button>

    <Button
        variant="outlined"
        fullWidth
        onClick={() => {
            setSearch("");
            setStatus("");
            setFromDate("");
            setToDate("");
        }}
    >
        Reset
    </Button>
  </Grid>

</Grid>

</Paper>

            {loading ? (

                <CircularProgress />

            ) : (

                <TableContainer
                    component={Paper}
                    sx={{
                        width: "100%",
                        borderRadius: 3,
                        boxShadow:4,
                        //overflow: "hidden"
                    }}
                >

                    <Table>

                        <TableHead sx={{ background:"#1976d2" }} >

                            <TableRow>

                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Equipment</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Certificate No</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Calibration Date</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Expiry Date</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Days Left</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Status</b></TableCell>
                                <TableCell sx={{color:"white",fontWeight:"bold"}}> <b>Actions</b> </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {filteredCertifications
                            .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                            )
                            .map((cert) => (

                                <TableRow key={cert.certificationId}>

                                    <TableCell>
                                        {cert.equipment?.equipmentName}
                                    </TableCell>

                                    <TableCell>
                                        {cert.certificateNumber}
                                    </TableCell>

                                    <TableCell>
                                        {cert.lastCalibrationDate}
                                    </TableCell>

                                    <TableCell>
                                        {cert.expiryDate}
                                    </TableCell>

                                    <TableCell>
                                        

                                    <Typography
                                        fontWeight="bold"
                                        color={
                                            getDaysLeft(cert.expiryDate) > 30
                                                ? "green"
                                                : getDaysLeft(cert.expiryDate) >= 0
                                                ? "orange"
                                                : "red"
                                        }
                                    >
                                        {
                                            getDaysLeft(cert.expiryDate) >= 0
                                                ? `${getDaysLeft(cert.expiryDate)} Days`
                                                : `${Math.abs(getDaysLeft(cert.expiryDate))} Days Ago`
                                        }
                                    </Typography>

                                    </TableCell>

                                        <TableCell>


                                        <Chip
                                            label={cert.status}
                                            color={
                                                cert.status === "Valid"
                                                    ? "success"
                                                    : cert.status === "Expiring Soon"
                                                    ? "warning"
                                                    : "error"
                                            }
                                        />

                                    </TableCell>
                                    <TableCell
    align="center"
    sx={{
        whiteSpace: "nowrap"
    }}
>
    <Box
        sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1
        }}
    >
        <IconButton
            size="small"
            color="primary"
            onClick={() => handleView(cert)}
        >
            <VisibilityIcon />
        </IconButton>

        {canDownload && (
        <IconButton
            size="small"
            color="success"
            onClick={() => handleDownload(cert)}
        >
            <DownloadIcon />
        </IconButton>
        )}

        {(canEdit || canDelete) && (
    <IconButton
        size="small"
        onClick={(e) => handleMenuClick(e, cert)}
        color="default"
    >
        <MoreVertIcon />
    </IconButton>
)}
    </Box>
</TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>
                    <TablePagination
    component="div"
    count={filteredCertifications.length}
    page={page}
    rowsPerPage={rowsPerPage}
    onPageChange={(event, newPage) => {
        setPage(newPage);
    }}
    onRowsPerPageChange={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }}
    rowsPerPageOptions={[5, 10, 25]}
/>

                </TableContainer>

                   )}

        </Box>

        <Dialog
    open={openDialog}
    onClose={handleCloseDialog}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>
        Certificate Details
    </DialogTitle>

    <DialogContent dividers>

        {selectedCertification && (

            <Box>

                <Typography>
                    <strong>Equipment:</strong>{" "}
                    {selectedCertification.equipment?.equipmentName}
                </Typography>

                <Typography>
                    <strong>Certificate No:</strong>{" "}
                    {selectedCertification.certificateNumber}
                </Typography>

                <Typography>
                    <strong>Type:</strong>{" "}
                    {selectedCertification.certificateType}
                </Typography>

                <Typography>
                    <strong>Issued By:</strong>{" "}
                    {selectedCertification.issuedBy}
                </Typography>

                <Typography>
                    <strong>Issue Date:</strong>{" "}
                    {selectedCertification.issueDate}
                </Typography>

                <Typography>
                    <strong>Last Calibration:</strong>{" "}
                    {selectedCertification.lastCalibrationDate}
                </Typography>

                <Typography>
                    <strong>Next Calibration:</strong>{" "}
                    {selectedCertification.nextCalibrationDate}
                </Typography>

                <Typography>
                    <strong>Expiry Date:</strong>{" "}
                    {selectedCertification.expiryDate}
                </Typography>

                <Typography>
                    <strong>Status:</strong>{" "}
                    {selectedCertification.status}
                </Typography>

                <Typography>
                    <strong>Remarks:</strong>{" "}
                    {selectedCertification.remarks}
                </Typography>

            </Box>

        )}

    </DialogContent>

    <DialogActions>

        <Button
            onClick={handleCloseDialog}
            variant="contained"
        >
            Close
        </Button>

    </DialogActions>

</Dialog>

<Menu
    anchorEl={anchorEl}
    open={openMenu}
    onClose={handleMenuClose}
>

    <MenuItem
        onClick={() => {

            handleView(selectedCert);

            handleMenuClose();

        }}
    >
        <VisibilityIcon
            sx={{ mr: 1 }}
        />

        View

    </MenuItem>

    {canEdit && (
    <MenuItem onClick={handleEdit}>
        <EditIcon sx={{ mr: 1 }} />
        Edit
    </MenuItem>
)}

    {canDelete && (
    <MenuItem
        onClick={handleDelete}
        sx={{ color: "red" }}
    >
        <DeleteIcon sx={{ mr: 1 }} />
        Delete
    </MenuItem>
)}

</Menu>

<Dialog
    open={openAddDialog}
    onClose={() => setOpenAddDialog(false)}
    maxWidth="md"
    fullWidth
>

    <DialogTitle>
        Add Equipment Certification
    </DialogTitle>

    <DialogContent>

        <FormControl
            fullWidth
            margin="normal"
        >
            <InputLabel>Equipment</InputLabel>

            <Select
                label="Equipment"
                value={newCertificate.equipment.equipmentId}
                onChange={(e)=>

                    setNewCertificate({

                        ...newCertificate,

                        equipment:{
                            equipmentId:e.target.value
                        }

                    })

                }
            >

                {equipmentList.map((eq)=>(

                    <MenuItem
                        key={eq.equipmentId}
                        value={eq.equipmentId}
                    >

                        {eq.equipmentName}

                    </MenuItem>

                ))}

            </Select>

        </FormControl>

        <TextField
            fullWidth
            margin="normal"
            label="Certificate Number"
            value={newCertificate.certificateNumber}
            onChange={(e)=>

                setNewCertificate({

                    ...newCertificate,

                    certificateNumber:e.target.value

                })

            }
        />

        <TextField
            fullWidth
            margin="normal"
            label="Certificate Type"
            value={newCertificate.certificateType}
            onChange={(e)=>

                setNewCertificate({

                    ...newCertificate,

                    certificateType:e.target.value

                })

            }
        />

        <TextField
            fullWidth
            margin="normal"
            label="Issued By"
            value={newCertificate.issuedBy}
            onChange={(e)=>

                setNewCertificate({

                    ...newCertificate,

                    issuedBy:e.target.value

                })

            }
        />

        <TextField
    fullWidth
    margin="normal"
    type="date"
    label="Issue Date"
    InputLabelProps={{ shrink: true }}
    value={newCertificate.issueDate}
    onChange={(e) =>
        setNewCertificate({
            ...newCertificate,
            issueDate: e.target.value
        })
    }
    slotProps={{
        htmlInput: {
            style: {
                color: newCertificate.issueDate
                    ? "inherit"
                    : "transparent",
            },
        },
    }}
/>

<TextField
    fullWidth
    margin="normal"
    type="date"
    label="Last Calibration Date"
    InputLabelProps={{ shrink: true }}
    value={newCertificate.lastCalibrationDate}
    onChange={(e) =>
        setNewCertificate({
            ...newCertificate,
            lastCalibrationDate: e.target.value
        })
    }
    slotProps={{
        htmlInput: {
            style: {
                color: newCertificate.lastCalibrationDate
                    ? "inherit"
                    : "transparent",
            },
        },
    }}
/>

        <TextField
    fullWidth
    margin="normal"
    type="date"
    label="Expiry Date"
    InputLabelProps={{ shrink: true }}
    value={newCertificate.expiryDate}
    onChange={(e) =>
        setNewCertificate({
            ...newCertificate,
            expiryDate: e.target.value
        })
    }
    slotProps={{
        htmlInput: {
            style: {
                color: newCertificate.expiryDate
                    ? "inherit"
                    : "transparent",
            },
        },
    }}
/>
        <TextField
            fullWidth
            margin="normal"
            label="Remarks"
            multiline
            rows={3}
            value={newCertificate.remarks}
            onChange={(e)=>

                setNewCertificate({

                    ...newCertificate,

                    remarks:e.target.value

                })

            }
        />

    </DialogContent>

    <DialogActions>

        <Button
            onClick={()=>setOpenAddDialog(false)}
        >
            Cancel
        </Button>

        <Button
            variant="contained"
            onClick={handleAddCertificate}
        >
            Save
        </Button>

    </DialogActions>

</Dialog>

<Dialog
    open={openEditDialog}
    onClose={() => setOpenEditDialog(false)}
    maxWidth="sm"
    fullWidth
>

    <DialogTitle>
        Edit Certification
    </DialogTitle>

    <DialogContent>

        <TextField
            fullWidth
            margin="normal"
            label="Certificate Number"
            value={editData.certificateNumber || ""}
            onChange={(e) =>
                setEditData({
                    ...editData,
                    certificateNumber: e.target.value
                })
            }
        />

        <TextField
            fullWidth
            margin="normal"
            label="Issued By"
            value={editData.issuedBy || ""}
            onChange={(e) =>
                setEditData({
                    ...editData,
                    issuedBy: e.target.value
                })
            }
        />

        <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Expiry Date"
            InputLabelProps={{ shrink: true }}
            value={editData.expiryDate || ""}
            onChange={(e) =>
                setEditData({
                    ...editData,
                    expiryDate: e.target.value
                })
            }
        />

    </DialogContent>

    <DialogActions>

        <Button
            onClick={() => setOpenEditDialog(false)}
        >
            Cancel
        </Button>

        <Button
            variant="contained"
            onClick={handleSaveEdit}
        >
            Save
        </Button>

    </DialogActions>

</Dialog>
    </Box>

    );
}

export default Certification;