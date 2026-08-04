import { useEffect, useState } from "react";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    TextField,
} from "@mui/material";

function InstitutionDialog({
    open,
    handleClose,
    handleSave,
    institution,
}) {

    const [formData, setFormData] = useState({

        institutionId: null,

        institutionName: "",

        city: "",

        state: "",

        email: "",

        phone: "",

        type: "",

    });

    useEffect(() => {

        if (institution) {

            setFormData(institution);

        } else {

            setFormData({

                institutionId: null,

                institutionName: "",

                city: "",

                state: "",

                email: "",

                phone: "",

                type: "",

            });

        }

    }, [institution]);

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

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

                {institution ? "Edit Institution" : "Add Institution"}

            </DialogTitle>

            <DialogContent>

                <Stack spacing={2} sx={{ mt: 2 }}>

                    <TextField
                        label="Institution Name"
                        name="institutionName"
                        value={formData.institutionName}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        fullWidth
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

export default InstitutionDialog;