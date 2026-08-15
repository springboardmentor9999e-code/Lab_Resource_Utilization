import { useEffect, useState } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    LinearProgress,
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";

function InstitutionDashboard() {

    const { userId, institutionId } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);

                const requests = [];

                // Student's own bookings
                if (userId) {
                    requests.push(
                        axiosInstance.get(
                            `/bookings/user/${userId}`
                        )
                    );
                } else {
                    requests.push(Promise.resolve({ data: [] }));
                }

                // Equipment available in student's institution
                requests.push(
                    axiosInstance.get("/equipment/institution")
                );

                const [
                    bookingRes,
                    equipmentRes
                ] = await Promise.all(requests);

                setBookings(bookingRes.data || []);
                setEquipment(equipmentRes.data || []);

            } catch (error) {

                console.error(
                    "Student dashboard loading failed:",
                    error
                );

                setBookings([]);
                setEquipment([]);

            } finally {

                setLoading(false);

            }

        };

        loadDashboard();

    }, [userId, institutionId]);


    // --------------------------------------------------
    // BOOKING COUNTS
    // --------------------------------------------------

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        booking =>
            String(booking.status).toUpperCase() === "PENDING"
    ).length;

    const approvedBookings = bookings.filter(
        booking =>
            String(booking.status).toUpperCase() === "APPROVED"
    ).length;

    const completedBookings = bookings.filter(
        booking =>
            String(booking.status).toUpperCase() === "COMPLETED"
    ).length;


    // --------------------------------------------------
    // EQUIPMENT
    // --------------------------------------------------

    const availableEquipment = equipment.reduce(
        (total, item) =>
            total + (Number(item.availableQuantity) || 0),
        0
    );


    // --------------------------------------------------
    // RECENT BOOKINGS
    // --------------------------------------------------

    const recentBookings = [...bookings]
        .sort((a, b) => {

            const dateA = new Date(
                `${a.bookingDate || "1900-01-01"}T${a.startTime || "00:00"}`
            );

            const dateB = new Date(
                `${b.bookingDate || "1900-01-01"}T${b.startTime || "00:00"}`
            );

            return dateB - dateA;

        })
        .slice(0, 5);


    // --------------------------------------------------
    // STATUS COLOR
    // --------------------------------------------------

    const getStatusColor = (status) => {

        switch (String(status).toUpperCase()) {

            case "APPROVED":
                return "success";

            case "COMPLETED":
                return "info";

            case "PENDING":
                return "warning";

            case "REJECTED":
                return "error";

            case "CANCELLED":
                return "default";

            default:
                return "default";
        }

    };


    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {

        return (
            <Box sx={{ p: 4 }}>

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    mb={2}
                >
                    Student Dashboard
                </Typography>

                <LinearProgress />

            </Box>
        );

    }


    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (

        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                padding: {
                    xs: 2,
                    sm: 3,
                    md: 4
                }
            }}
        >

            {/* HEADER */}

            <Box
                sx={{
                    textAlign: "center",
                    mb: 4
                }}
            >

                <Typography
                    variant="h3"
                    fontWeight="500"
                    sx={{
                        color: "#5d6685",
                        fontSize: {
                            xs: "2rem",
                            sm: "2.5rem",
                            md: "3rem"
                        }
                    }}
                >
                    Student Dashboard
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    Your laboratory resource utilization overview
                </Typography>

            </Box>


            {/* STAT CARDS */}

            <Grid
                container
                spacing={3}
                sx={{
                    mb: 4,
                    justifyContent: "center"
                }}
            >

                {/* TOTAL BOOKINGS */}

                <Grid item xs={12} sm={6} md={3}>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            height: "100%"
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3
                            }}
                        >

                            <Typography
                                color="text.secondary"
                                fontSize="1.1rem"
                            >
                                My Bookings
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {totalBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* PENDING */}

                <Grid item xs={12} sm={6} md={3}>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            height: "100%"
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3
                            }}
                        >

                            <Typography
                                color="text.secondary"
                                fontSize="1.1rem"
                            >
                                Pending
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {pendingBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* COMPLETED */}

                <Grid item xs={12} sm={6} md={3}>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            height: "100%"
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3
                            }}
                        >

                            <Typography
                                color="text.secondary"
                                fontSize="1.1rem"
                            >
                                Completed
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {completedBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* AVAILABLE EQUIPMENT */}

                <Grid item xs={12} sm={6} md={3}>

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            height: "100%"
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3
                            }}
                        >

                            <Typography
                                color="text.secondary"
                                fontSize="1.1rem"
                            >
                                Available Equipment
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                sx={{ mt: 1 }}
                            >
                                {availableEquipment}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>


            {/* MAIN CONTENT */}

            <Grid
                container
                spacing={3}
            >

                {/* BOOKING HISTORY */}

                <Grid
                    item
                    xs={12}
                    md={7}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                textAlign="center"
                                mb={3}
                            >
                                Booking History
                            </Typography>


                            {recentBookings.length === 0 ? (

                                <Typography
                                    color="text.secondary"
                                    textAlign="center"
                                    py={4}
                                >
                                    No bookings found.
                                </Typography>

                            ) : (

                                recentBookings.map(
                                    (booking) => (

                                        <Box
                                            key={booking.bookingId}
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 2,
                                                mb: 1.5,
                                                backgroundColor:
                                                    "#f5f7fb",
                                                borderRadius: 2
                                            }}
                                        >

                                            <Box>

                                                <Typography
                                                    fontWeight="bold"
                                                >
                                                    {booking.equipment
                                                        ?.equipmentName ||
                                                        "Laboratory Booking"}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {booking.laboratory
                                                        ?.labName ||
                                                        "Laboratory"}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {booking.bookingDate ||
                                                        "Date not available"}
                                                </Typography>

                                            </Box>


                                            <Chip
                                                label={
                                                    booking.status ||
                                                    "UNKNOWN"
                                                }
                                                color={
                                                    getStatusColor(
                                                        booking.status
                                                    )
                                                }
                                                sx={{
                                                    fontWeight:
                                                        "bold"
                                                }}
                                            />

                                        </Box>

                                    )
                                )

                            )}

                        </CardContent>

                    </Card>

                </Grid>


                {/* BOOKING SUMMARY */}

                <Grid
                    item
                    xs={12}
                    md={5}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                            height: "100%"
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                textAlign="center"
                                mb={3}
                            >
                                Booking Summary
                            </Typography>


                            <Box
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: "#f5f7fb",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent:
                                        "space-between"
                                }}
                            >

                                <Typography>
                                    Total Requests
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                >
                                    {totalBookings}
                                </Typography>

                            </Box>


                            <Box
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: "#f5f7fb",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent:
                                        "space-between"
                                }}
                            >

                                <Typography>
                                    Approved
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                >
                                    {approvedBookings}
                                </Typography>

                            </Box>


                            <Box
                                sx={{
                                    p: 2,
                                    mb: 2,
                                    backgroundColor: "#f5f7fb",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent:
                                        "space-between"
                                }}
                            >

                                <Typography>
                                    Pending
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                >
                                    {pendingBookings}
                                </Typography>

                            </Box>


                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: "#f5f7fb",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent:
                                        "space-between"
                                }}
                            >

                                <Typography>
                                    Completed
                                </Typography>

                                <Typography
                                    fontWeight="bold"
                                >
                                    {completedBookings}
                                </Typography>

                            </Box>

                        </CardContent>

                    </Card>

                </Grid>


                {/* EQUIPMENT AVAILABILITY */}

                <Grid
                    item
                    xs={12}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3
                        }}
                    >

                        <CardContent>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                textAlign="center"
                                mb={3}
                            >
                                Equipment Availability
                            </Typography>


                            {equipment.length === 0 ? (

                                <Typography
                                    color="text.secondary"
                                    textAlign="center"
                                >
                                    No equipment available.
                                </Typography>

                            ) : (

                                equipment
                                    .slice(0, 8)
                                    .map((item) => {

                                        const total =
                                            Number(
                                                item.quantity
                                            ) || 0;

                                        const available =
                                            Number(
                                                item.availableQuantity
                                            ) || 0;

                                        const percentage =
                                            total > 0
                                                ? Math.round(
                                                    (
                                                        available /
                                                        total
                                                    ) * 100
                                                )
                                                : 0;

                                        return (

                                            <Box
                                                key={
                                                    item.equipmentId
                                                }
                                                sx={{
                                                    mb: 2
                                                }}
                                            >

                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        mb: 0.5
                                                    }}
                                                >

                                                    <Typography>
                                                        {
                                                            item.equipmentName
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                    >
                                                        {available}/
                                                        {total} available
                                                    </Typography>

                                                </Box>


                                                <LinearProgress
                                                    variant="determinate"
                                                    value={
                                                        percentage
                                                    }
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 5
                                                    }}
                                                />

                                            </Box>

                                        );

                                    })

                            )}

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );
}

export default InstitutionDashboard;