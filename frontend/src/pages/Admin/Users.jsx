import { useEffect, useState } from "react";
import userService from "../../services/userService";
import laboratoryService from "../../services/laboratoryService";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import roleService from "../../services/roleService";
import institutionService from "../../services/institutionService";


import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [laboratories, setLaboratories] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [roles, setRoles] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    roleId: "",
    institutionId: "",
    labId: "",
  });

  useEffect(() => {
      loadUsers();
      loadRoles();
      loadInstitutions();
      loadLaboratories();
  }, []);

  // Load Users
  const loadUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRoles = async () => {
    try {
        const data = await roleService.getAllRoles();
        setRoles(data);
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

const loadLaboratories = async () => {
    try {
        const data = await laboratoryService.getAllLaboratories();
        setLaboratories(data);
    } catch (error) {
        console.error(error);
    }
};
  const handleEdit = (user) => {

  setEditing(true);

  setEditingId(user.userId);

  setNewUser({

    fullName: user.fullName,
    email: user.email,
    password: "",
    phone: user.phone,
    department: user.department,

    roleId: user.role?.roleId || "",

    institutionId:
        user.institution?.institutionId || "",

    labId:
        user.laboratory?.labId || ""

});

const labs = laboratories.filter(
    (lab) =>
        lab.institution?.institutionId ===
        user.institution?.institutionId
);

setFilteredLabs(labs);

  setOpen(true);
};

const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this user?"
  );

  if (!confirmDelete) return;

  try {

    await userService.deleteUser(id);

    setSnackbarMessage("User Deleted Successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    loadUsers();

  } catch (error) {

    console.error(error);

    setSnackbarMessage("Failed to Delete User");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

  // Save User
  const handleSave = async () => {
  try {

    const rolesRequireLab = [2,3,4];

if (
    rolesRequireLab.includes(newUser.roleId) &&
    !newUser.labId
) {

    setSnackbarMessage(
        "Please select a laboratory."
    );

    setSnackbarSeverity("error");

    setSnackbarOpen(true);

    return;
}

    if (editing) {

      await userService.updateUser(editingId, newUser);

      setSnackbarMessage("User Updated Successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

    } else {

      await userService.createUser(newUser);

      setSnackbarMessage("User Added Successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }

    setOpen(false);

    setEditing(false);
    setEditingId(null);

    setNewUser({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      roleId: "",
    });

    loadUsers();

  } catch (error) {

    console.error(error);

    setSnackbarMessage("Operation Failed");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};


  const filteredUsers = users.filter(
    (user) =>
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Users Management
      </Typography>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <TextField
          label="Search User"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />

        <Button
          variant="contained"
          onClick={() => {

            setEditing(false);
            setEditingId(null);

            setNewUser({
              fullName: "",
              email: "",
              password: "",
              phone: "",
              department: "",
              roleId: "",
            });

            setOpen(true);

          }}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>

          <TableHead sx={{ background:"#1976d2" }} >

            <TableRow>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>ID</b></TableCell>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Name</b></TableCell>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Email</b></TableCell>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Department</b></TableCell>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Laboratory</b></TableCell>
              <TableCell sx={{color:"white",fontWeight:"bold"}}><b>Role</b></TableCell>
              <TableCell align="center" sx={{color:"white",fontWeight:"bold"}}><b>Actions</b> </TableCell>
            </TableRow>

          </TableHead>

          <TableBody>

            {filteredUsers.map((user) => (

              <TableRow key={user.userId}>

    <TableCell>{user.userId}</TableCell>

    <TableCell>{user.fullName}</TableCell>

    <TableCell>{user.email}</TableCell>

    <TableCell>{user.department}</TableCell>
    <TableCell>
    {user.laboratory?.labName || "-"}
</TableCell>

    <TableCell>{user.role?.roleName}</TableCell>

    <TableCell align="center">

        <IconButton
    color="primary"
    onClick={() => handleEdit(user)}
>
    <EditIcon />
</IconButton>
        <IconButton
          color="error"
          onClick={() => handleDelete(user.userId)}
        >
        <DeleteIcon />
        </IconButton>
    </TableCell>

</TableRow>
            ))}

          </TableBody>

        </Table>
      </TableContainer>

      {/* Add User Dialog */}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>{editing ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>

          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={newUser.fullName}
            onChange={(e) =>
              setNewUser({ ...newUser, fullName: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={newUser.phone}
            onChange={(e) =>
              setNewUser({ ...newUser, phone: e.target.value })
            }
          />

          <TextField
            margin="dense"
            label="Department"
            fullWidth
            value={newUser.department}
            onChange={(e) =>
              setNewUser({ ...newUser, department: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Institution"
            select
            fullWidth
            value={newUser.institutionId}
            onChange={(e) => {

    const institutionId = Number(e.target.value);

    const labs = laboratories.filter(
        (lab) =>
            lab.institution?.institutionId === institutionId
    );

    setFilteredLabs(labs);

    setNewUser({
        ...newUser,
        institutionId,
        labId: "",
    });

}}
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

                {[3,2,4].includes(newUser.roleId) && (
        <TextField
            margin="dense"
            label="Laboratory"
            select
            fullWidth
            value={newUser.labId}
            onChange={(e)=>
                setNewUser({
                    ...newUser,
                    labId:Number(e.target.value),
                })
            }
        >

            {filteredLabs.map((lab) => (
                <MenuItem
                    key={lab.labId}
                    value={lab.labId}
                >
                    {lab.labName}
                </MenuItem>
            ))}

        </TextField>
        )}

          <TextField
            margin="dense"
            label="Role"
            select
            fullWidth
            value={newUser.roleId}
            onChange={(e) => {

              const roleId = Number(e.target.value);

              setNewUser({

                  ...newUser,

                  roleId,

                  labId: [3, 5, 6].includes(roleId)
                      ? newUser.labId
                      : ""

              });

          }}
          >
            {roles.map((role)=>(
                <MenuItem
                    key={role.roleId}
                    value={role.roleId}
                >
                    {role.roleName}
                </MenuItem>
            ))}
          </TextField>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
          variant="contained"
          onClick={handleSave}
          >
          {editing ? "Update User" : "Save User"}
          </Button>
        </DialogActions>

      </Dialog>
            <Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{
    vertical: "top",
    horizontal: "right",
  }}
>
  <Alert
    severity={snackbarSeverity}
    variant="filled"
    onClose={() => setSnackbarOpen(false)}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
    </>
  );
}

export default Users;