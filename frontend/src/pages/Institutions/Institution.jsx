import { useEffect, useState } from "react";

import institutionService from "../../services/institutionService";
import InstitutionDialog from "./InstitutionDialog";

import {
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";

function Institution() {

    const [institutions, setInstitutions] = useState([]);

    const [search, setSearch] = useState("");

    const [openDialog, setOpenDialog] = useState(false);

    const [selectedInstitution, setSelectedInstitution] = useState(null);

    useEffect(() => {

        loadInstitutions();

    }, []);

    const loadInstitutions = async () => {

        try {

            const data =
                await institutionService.getAllInstitutions();

            setInstitutions(data);

        } catch (error) {

            console.error(error);

        }

    };

    const handleOpenDialog = (institution = null) => {

        setSelectedInstitution(institution);

        setOpenDialog(true);

    };

    const handleCloseDialog = () => {

        setSelectedInstitution(null);

        setOpenDialog(false);

    };

    const handleSaveInstitution = async (institution) => {

        try {

            if (institution.institutionId) {

                await institutionService.updateInstitution(
                    institution.institutionId,
                    institution
                );

            } else {

                await institutionService.createInstitution(
                    institution
                );

            }

            loadInstitutions();

            handleCloseDialog();

        } catch (error) {

            console.error(error);

        }

    };

    const filteredInstitutions = institutions.filter((i) =>
        i.institutionName
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleDeleteInstitution = async (id) => {

    if (!window.confirm("Delete this institution?"))
        return;

    try {

        await institutionService.deleteInstitution(id);

        loadInstitutions();

    } catch (error) {

        console.error(error);

    }

};

    return (

        <>

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={3}
            >
                Institution Management
            </Typography>

            <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                mb={3}
            >

                <Card sx={{ flex:1,minWidth:250 }}>

                    <CardContent>

                        <Typography>
                            Total Institutions
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                        >
                            {institutions.length}
                        </Typography>

                    </CardContent>

                </Card>

            </Box>

            <Box
                display="flex"
                justifyContent="space-between"
                mb={3}
            >

                <TextField
                    placeholder="Search Institution"
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    sx={{ width:300 }}
                />

                <Button
                    variant="contained"
                    onClick={()=>handleOpenDialog()}
                >
                    Add Institution
                </Button>

            </Box>

            <TableContainer component={Paper}>

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>Name</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>State</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Actions</TableCell>
                            <TableCell>

    <Button
        size="small"
        onClick={() => handleOpenDialog(institution)}
    >
        Edit
    </Button>

    <Button
        size="small"
        color="error"
        onClick={() => handleDeleteInstitution(institution.institutionId)}
    >
        Delete
    </Button>

</TableCell>
                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {filteredInstitutions.map((institution)=>(

                            <TableRow
                                key={institution.institutionId}
                            >

                                <TableCell>
                                    {institution.institutionName}
                                </TableCell>

                                <TableCell>
                                    {institution.city}
                                </TableCell>

                                <TableCell>
                                    {institution.state}
                                </TableCell>

                                <TableCell>
                                    {institution.email}
                                </TableCell>

                                <TableCell>
                                    {institution.phone}
                                </TableCell>

                                <TableCell>
                                    {institution.type}
                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer>

            <InstitutionDialog

                open={openDialog}

                handleClose={handleCloseDialog}

                handleSave={handleSaveInstitution}

                institution={selectedInstitution}

            />

        </>

    );

}

export default Institution;