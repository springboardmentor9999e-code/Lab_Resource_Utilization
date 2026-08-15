import { useEffect, useMemo, useState } from "react";

import {
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Box,
    Divider,
} from "@mui/material";

import {
    EventAvailable,
    PendingActions,
    TaskAlt,
    Inventory2,
    NotificationsActive,
} from "@mui/icons-material";

import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";

function StudentDashboard() {

    const { userId, fullName } = useAuth();

    const [bookings, setBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [equipment, setEquipment] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                setLoading(true);

                const [
                    bookingRes,
                    notificationRes,
                    equipmentRes,
                ] = await Promise.all([
                    axiosInstance.get(`/bookings/user/${userId}`),
                    axiosInstance.get(`/notifications/user/${userId}`),
                    axiosInstance.get("/equipment"),
                ]);

                setBookings(
                    Array.isArray(bookingRes.data)
                        ? bookingRes.data
                        : []
                );

                setNotifications(
                    Array.isArray(notificationRes.data)
                        ? notificationRes.data
                        : []
                );

                setEquipment(
                    Array.isArray(equipmentRes.data)
                        ? equipmentRes.data
                        : []
                );

            } catch (error) {

                console.error(
                    "Student dashboard loading failed:",
                    error
                );

                setBookings([]);
                setNotifications([]);
                setEquipment([]);

            } finally {

                setLoading(false);

            }

        };

        if (userId) {
            loadDashboard();
        }

    }, [userId]);


    /* =========================
       DASHBOARD STATISTICS
       ========================= */

    const totalBookings = bookings.length;

    const pendingBookings = bookings.filter(
        (booking) =>
            String(booking.status || "").toUpperCase() === "PENDING"
    ).length;

    const completedBookings = bookings.filter(
        (booking) =>
            String(booking.status || "").toUpperCase() === "COMPLETED"
    ).length;

    const availableEquipment = equipment.filter(
        (item) => Number(item.availableQuantity || 0) > 0
    ).length;


    /* =========================
       RECENT BOOKINGS
       ========================= */

    const recentBookings = useMemo(() => {

        return [...bookings]
            .sort((a, b) => {

                const dateA = new Date(
                    a.bookingDate || a.createdAt || 0
                );

                const dateB = new Date(
                    b.bookingDate || b.createdAt || 0
                );

                return dateB - dateA;

            })
            .slice(0, 5);

    }, [bookings]);


    /* =========================
       STATUS CHIP
       ========================= */

    const getStatusColor = (status) => {

        const value = String(status || "").toUpperCase();

        if (value === "APPROVED") {
            return "success";
        }

        if (value === "PENDING") {
            return "warning";
        }

        if (value === "COMPLETED") {
            return "info";
        }

        if (value === "REJECTED") {
            return "error";
        }

        if (value === "CANCELLED") {
            return "default";
        }

        return "default";
    };


    /* =========================
       DATE FORMAT
       ========================= */

    const formatDate = (date) => {

        if (!date) {
            return "Date not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
            }
        );

    };


    /* =========================
       LOADING STATE
       ========================= */

    if (loading) {

        return (
            <Box>

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    mb={3}
                >
                    Student Dashboard
                </Typography>

                <LinearProgress />

            </Box>
        );

    }


    return (

        <Box
            sx={{
                width: "100%",
                pb: 4,
            }}
        >

            {/* =========================
                HEADER
               ========================= */}

            <Box
                sx={{
                    mb: 4,
                    textAlign: "center",
                }}
            >

                <Typography
                    variant="h3"
                    fontWeight="400"
                    sx={{
                        color: "#5d6685",
                        mb: 0.5,
                    }}
                >
                    Welcome, {fullName || "Student"} 👋
                </Typography>

                <Typography
                    variant="h6"
                    color="text.secondary"
                    fontWeight="400"
                >
                    Your laboratory resource utilization overview
                </Typography>

            </Box>


            {/* =========================
                SUMMARY CARDS
               ========================= */}

            <Grid
                container
                spacing={3}
                sx={{
                    mb: 4,
                }}
            >

                {/* MY BOOKINGS */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3,
                            }}
                        >

                            <EventAvailable
                                sx={{
                                    fontSize: 34,
                                    color: "#1976d2",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                color="text.secondary"
                                mb={0.5}
                            >
                                My Bookings
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {totalBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* PENDING */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3,
                            }}
                        >

                            <PendingActions
                                sx={{
                                    fontSize: 34,
                                    color: "#ed6c02",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                color="text.secondary"
                                mb={0.5}
                            >
                                Pending
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {pendingBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* COMPLETED */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3,
                            }}
                        >

                            <TaskAlt
                                sx={{
                                    fontSize: 34,
                                    color: "#2e7d32",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                color="text.secondary"
                                mb={0.5}
                            >
                                Completed
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {completedBookings}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>


                {/* AVAILABLE EQUIPMENT */}

                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                textAlign: "center",
                                py: 3,
                            }}
                        >

                            <Inventory2
                                sx={{
                                    fontSize: 34,
                                    color: "#9c27b0",
                                    mb: 1,
                                }}
                            />

                            <Typography
                                color="text.secondary"
                                mb={0.5}
                            >
                                Available Equipment
                            </Typography>

                            <Typography
                                variant="h3"
                                fontWeight="bold"
                            >
                                {availableEquipment}
                            </Typography>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>


            {/* =========================
                BOOKING HISTORY + NOTIFICATIONS
               ========================= */}

            <Grid
                container
                spacing={3}
                sx={{
                    mb: 4,
                }}
            >

                {/* BOOKING HISTORY */}

                <Grid
                    item
                    xs={12}
                    md={7}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="500"
                                textAlign="center"
                                mb={3}
                            >
                                Booking History
                            </Typography>

                            {recentBookings.length === 0 ? (

                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign: "center",
                                    }}
                                >

                                    <EventAvailable
                                        sx={{
                                            fontSize: 45,
                                            color: "text.disabled",
                                            mb: 1,
                                        }}
                                    />

                                    <Typography
                                        color="text.secondary"
                                    >
                                        No bookings found.
                                    </Typography>

                                </Box>

                            ) : (

                                recentBookings.map((booking) => {

                                    const status =
                                        String(
                                            booking.status || ""
                                        ).toUpperCase();

                                    return (

                                        <Box
                                            key={
                                                booking.bookingId ||
                                                Math.random()
                                            }
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                gap: 2,
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 2,
                                                backgroundColor:
                                                    "#f5f7fb",
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    minWidth: 0,
                                                }}
                                            >

                                                <Typography
                                                    fontWeight="bold"
                                                    sx={{
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    {
                                                        booking
                                                            .equipment
                                                            ?.equipmentName ||
                                                        booking
                                                            .equipmentName ||
                                                        "Laboratory Booking"
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {
                                                        booking
                                                            .laboratory
                                                            ?.labName ||
                                                        booking
                                                            .laboratoryName ||
                                                        "Laboratory"
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {formatDate(
                                                        booking.bookingDate ||
                                                        booking.createdAt
                                                    )}
                                                </Typography>

                                            </Box>

                                            <Chip
                                                label={
                                                    status ||
                                                    "UNKNOWN"
                                                }
                                                color={
                                                    getStatusColor(
                                                        status
                                                    )
                                                }
                                                sx={{
                                                    fontWeight: "bold",
                                                }}
                                            />

                                        </Box>

                                    );

                                })

                            )}

                        </CardContent>

                    </Card>

                </Grid>


                {/* NOTIFICATIONS */}

                <Grid
                    item
                    xs={12}
                    md={5}
                >

                    <Card
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 1,
                                    mb: 3,
                                }}
                            >

                                <NotificationsActive
                                    sx={{
                                        color: "#1976d2",
                                    }}
                                />

                                <Typography
                                    variant="h5"
                                    fontWeight="500"
                                >
                                    Notifications
                                </Typography>

                            </Box>

                            {notifications.length === 0 ? (

                                <Box
                                    sx={{
                                        py: 5,
                                        textAlign: "center",
                                    }}
                                >

                                    <Typography
                                        color="text.secondary"
                                    >
                                        No new notifications.
                                    </Typography>

                                </Box>

                            ) : (

                                notifications
                                    .slice(0, 5)
                                    .map((notification) => (

                                        <Box
                                            key={
                                                notification.notificationId ||
                                                Math.random()
                                            }
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 2,
                                                backgroundColor:
                                                    "#f5f7fb",
                                            }}
                                        >

                                            <Typography
                                                fontWeight="bold"
                                                mb={0.5}
                                            >
                                                {
                                                    notification.title ||
                                                    "Notification"
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {
                                                    notification.message ||
                                                    "No message available."
                                                }
                                            </Typography>

                                        </Box>

                                    ))

                            )}

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>


            {/* =========================
                EQUIPMENT AVAILABILITY
               ========================= */}

            <Card
                sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent
                    sx={{
                        p: 3,
                    }}
                >

                    <Typography
                        variant="h5"
                        fontWeight="500"
                        textAlign="center"
                        mb={1}
                    >
                        Equipment Availability Overview
                    </Typography>

                    <Typography
                        color="text.secondary"
                        textAlign="center"
                        mb={3}
                    >
                        Current availability of laboratory equipment
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {equipment.length === 0 ? (

                        <Box
                            sx={{
                                py: 4,
                                textAlign: "center",
                            }}
                        >

                            <Typography
                                color="text.secondary"
                            >
                                No equipment information available.
                            </Typography>

                        </Box>

                    ) : (

                        equipment
                            .slice(0, 8)
                            .map((item) => {

                                const quantity =
                                    Number(
                                        item.quantity || 0
                                    );

                                const availableQuantity =
                                    Number(
                                        item.availableQuantity || 0
                                    );

                                const percentage =
                                    quantity > 0
                                        ? Math.min(
                                            100,
                                            Math.max(
                                                0,
                                                (
                                                    availableQuantity /
                                                    quantity
                                                ) * 100
                                            )
                                        )
                                        : 0;

                                return (

                                    <Box
                                        key={
                                            item.equipmentId ||
                                            item.id
                                        }
                                        mb={2.5}
                                    >

                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems:
                                                    "center",
                                                mb: 0.7,
                                            }}
                                        >

                                            <Typography
                                                fontWeight="500"
                                            >
                                                {
                                                    item.equipmentName ||
                                                    "Equipment"
                                                }
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {availableQuantity}/
                                                {quantity} available
                                            </Typography>

                                        </Box>

                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                                height: 9,
                                                borderRadius: 5,
                                            }}
                                        />

                                    </Box>

                                );

                            })

                    )}

                </CardContent>

            </Card>

        </Box>
    );
}

export default StudentDashboard;