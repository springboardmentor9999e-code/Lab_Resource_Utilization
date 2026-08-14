import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";


function Analytics() {

    const [bookingList, setBookingList] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const [monthlyUsage, setMonthlyUsage] = useState([]);
    const [equipmentBookings, setEquipmentBookings] = useState([]);
    const [equipmentRevenue, setEquipmentRevenue] = useState([]);
    const [equipmentHours, setEquipmentHours] = useState([]);


    useEffect(() => {

        fetchData();

    }, []);


    const fetchData = async () => {

        try {

            const bookingRes = await api.get("/booking");
            const equipmentRes = await api.get("/equipment");

            const bookings = bookingRes.data;
            const equipment = equipmentRes.data;

            setBookingList(bookings);
            setEquipmentList(equipment);

            processAnalytics(bookings, equipment);

        } catch (error) {

            console.log("Analytics API Error:", error);

        }

    };


    const processAnalytics = (bookings, equipment) => {

        // Only completed bookings are useful for usage/revenue analytics
        const completedBookings = bookings.filter(
            booking => booking.status === "COMPLETED"
        );


        // =====================================================
        // 1. MONTHLY EQUIPMENT USAGE
        // =====================================================

        const monthlyMap = {};

        completedBookings.forEach(booking => {

            if (!booking.startTime) {
                return;
            }

            const date = new Date(booking.startTime);

            const month = date.toLocaleString("default", {
                month: "short"
            });

            const year = date.getFullYear();

            const key = `${month} ${year}`;

            if (!monthlyMap[key]) {
                monthlyMap[key] = 0;
            }

            monthlyMap[key]++;

        });


        const monthlyData = Object.keys(monthlyMap).map(month => ({

            month: month,

            usage: monthlyMap[month]

        }));


        setMonthlyUsage(monthlyData);


        // =====================================================
        // 2. MOST FREQUENTLY BOOKED EQUIPMENT
        // =====================================================

        const bookingMap = {};


        completedBookings.forEach(booking => {

            const equipmentItem = equipment.find(
                e => e.equipmentId === booking.equipmentId
            );

            if (!equipmentItem) {
                return;
            }

            const name = equipmentItem.equipmentName;

            if (!bookingMap[name]) {
                bookingMap[name] = 0;
            }

            bookingMap[name]++;

        });


        const equipmentBookingData = Object.keys(bookingMap)
            .map(name => ({

                equipment: name,

                bookings: bookingMap[name]

            }))
            .sort((a, b) => b.bookings - a.bookings);


        setEquipmentBookings(equipmentBookingData);


        // =====================================================
        // 3. REVENUE CONTRIBUTION BY EQUIPMENT
        // =====================================================

        const revenueMap = {};


        completedBookings.forEach(booking => {

            const equipmentItem = equipment.find(
                e => e.equipmentId === booking.equipmentId
            );

            if (!equipmentItem) {
                return;
            }

            const name = equipmentItem.equipmentName;

            if (!revenueMap[name]) {
                revenueMap[name] = 0;
            }

            revenueMap[name] += booking.totalCost || 0;

        });


        const revenueData = Object.keys(revenueMap)
            .map(name => ({

                name: name,

                value: Number(revenueMap[name].toFixed(2))

            }))
            .filter(item => item.value > 0);


        setEquipmentRevenue(revenueData);


        // =====================================================
        // 4. TOTAL EQUIPMENT USAGE HOURS
        // =====================================================

        const hoursMap = {};


        completedBookings.forEach(booking => {

            const equipmentItem = equipment.find(
                e => e.equipmentId === booking.equipmentId
            );

            if (!equipmentItem) {
                return;
            }

            if (!booking.startTime || !booking.endTime) {
                return;
            }

            const start = new Date(booking.startTime);

            const end = new Date(booking.endTime);

            const hours =
                (end - start) / (1000 * 60 * 60);


            const name = equipmentItem.equipmentName;


            if (!hoursMap[name]) {
                hoursMap[name] = 0;
            }

            hoursMap[name] += hours;

        });


        const hoursData = Object.keys(hoursMap)
            .map(name => ({

                equipment: name,

                hours: Number(hoursMap[name].toFixed(2))

            }))
            .sort((a, b) => b.hours - a.hours);


        setEquipmentHours(hoursData);

    };


    return (

        <div style={{ display: "flex" }}>

            <Sidebar />


            <div
                style={{
                    flex: 1,
                    padding: "30px",
                    backgroundColor: "#f8fafc",
                    minHeight: "100vh"
                }}
            >

                <h1>Analytics Dashboard</h1>

                <hr />


                {/* ================================================= */}
                {/* 1. MONTHLY EQUIPMENT USAGE - LINE CHART */}
                {/* ================================================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "20px",
                        marginTop: "25px",
                        borderRadius: "10px",
                        border: "1px solid #ddd"
                    }}
                >

                    <h2>Monthly Equipment Usage</h2>

                    <p>
                        Number of completed equipment bookings per month
                    </p>


                    <ResponsiveContainer width="100%" height={350}>

                        <LineChart data={monthlyUsage}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="month" />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Line
                                type="monotone"
                                dataKey="usage"
                                name="Equipment Usage"
                                stroke="#2563eb"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>


                {/* ================================================= */}
                {/* 2. MOST BOOKED EQUIPMENT - BAR CHART */}
                {/* ================================================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "20px",
                        marginTop: "25px",
                        borderRadius: "10px",
                        border: "1px solid #ddd"
                    }}
                >

                    <h2>Most Frequently Booked Equipment</h2>

                    <p>
                        Equipment with the highest number of completed bookings
                    </p>


                    <ResponsiveContainer width="100%" height={400}>

                        <BarChart data={equipmentBookings}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="equipment"
                                angle={-25}
                                textAnchor="end"
                                height={100}
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Bar
                                dataKey="bookings"
                                name="Number of Bookings"
                                fill="#2563eb"
                            />

                        </BarChart>

                    </ResponsiveContainer>

                </div>


                {/* ================================================= */}
                {/* 3. REVENUE BY EQUIPMENT - PIE CHART */}
                {/* ================================================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "20px",
                        marginTop: "25px",
                        borderRadius: "10px",
                        border: "1px solid #ddd"
                    }}
                >

                    <h2>Revenue Contribution by Equipment</h2>

                    <p>
                        Revenue generated by each equipment
                    </p>


                    {equipmentRevenue.length > 0 ? (

                        <ResponsiveContainer width="100%" height={400}>

                            <PieChart>

                                <Pie
                                    data={equipmentRevenue}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={130}
                                    label
                                >

                                    {equipmentRevenue.map(
                                        (entry, index) => (

                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    [
                                                        "#2563eb",
                                                        "#16a34a",
                                                        "#dc2626",
                                                        "#f59e0b",
                                                        "#9333ea",
                                                        "#0891b2"
                                                    ][index % 6]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>

                                <Tooltip
                                    formatter={(value) =>
                                        `₹${value}`
                                    }
                                />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    ) : (

                        <p>
                            No completed bookings with revenue available.
                        </p>

                    )}

                </div>


                {/* ================================================= */}
                {/* 4. TOTAL EQUIPMENT USAGE HOURS - AREA CHART */}
                {/* ================================================= */}

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "20px",
                        marginTop: "25px",
                        borderRadius: "10px",
                        border: "1px solid #ddd"
                    }}
                >

                    <h2>Total Equipment Usage Hours</h2>

                    <p>
                        Total number of hours each equipment was used
                    </p>


                    <ResponsiveContainer width="100%" height={400}>

                        <AreaChart data={equipmentHours}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="equipment"
                                angle={-25}
                                textAnchor="end"
                                height={100}
                            />

                            <YAxis />

                            <Tooltip />

                            <Legend />

                            <Area
                                type="monotone"
                                dataKey="hours"
                                name="Hours Used"
                                stroke="#16a34a"
                                fill="#16a34a"
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>


            </div>

        </div>

    );

}


export default Analytics;