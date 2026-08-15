import { useEffect, useState } from "react";
import utilizationService from "../../services/utilizationService";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
} from "@mui/material";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
} from "recharts";


function Utilization() {
    const [institutionData, setInstitutionData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [peakUsageData, setPeakUsageData] = useState([]);
    const [heatmapData, setHeatmapData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [idleEquipment, setIdleEquipment] = useState([]);
    const [userRole, setUserRole] = useState("");
  const [summary, setSummary] = useState({
    totalEquipment: 0,
    equipmentInUse: 0,
    availableEquipment: 0,
    maintenanceEquipment: 0,
    idleEquipment: 0,
    averageUtilization: 0,
  });

    const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {

    const storedRole = localStorage.getItem("role");

    if (storedRole) {

        setUserRole(storedRole);

    }

  const loadData = async () => {

    try {

      const summaryData = await utilizationService.getSummary();
      setSummary(summaryData);

      const institutions = await utilizationService.getInstitutionUtilization();
      setInstitutionData(institutions);

      const departments = await utilizationService.getDepartmentUtilization();
      setDepartmentData(departments);

      const equipmentData =
        await utilizationService.getEquipmentUtilization();
        setEquipmentList(equipmentData);

      const peakData = await utilizationService.getPeakUsageData();
      setPeakUsageData(peakData);

      const heatmap = await utilizationService.getHeatmap();
      setHeatmapData(heatmap);

      const trend = await utilizationService.getUtilizationTrend();
      setTrendData(trend);

      const idle = await utilizationService.getIdleEquipment();
      setIdleEquipment(idle);


    } catch (error) {

      console.error(error);

    }

  };

  loadData();

}, []);

  const cards = [

    {
      title: "Total Equipment",
      value: summary.totalEquipment,
    },

    {
      title: "Equipment In Use",
      value: summary.equipmentInUse,
    },

    {
      title: "Available Equipment",
      value: summary.availableEquipment,
    },

    {
      title: "Maintenance",
      value: summary.maintenanceEquipment,
    },

    {
      title: "Idle Equipment",
      value: summary.idleEquipment,
    },

    {
      title: "Average Utilization",
      value: `${summary.averageUtilization}%`,
    },

  ];

  const getColor = (value) => {

    if (value <= 30)
        return "#4CAF50";

    if (value <= 70)
        return "#FF9800";

    return "#F44336";

};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const groupedHeatmap = {};

heatmapData.forEach((item) => {

    if (!groupedHeatmap[item.laboratoryName]) {

        groupedHeatmap[item.laboratoryName] = {};

    }

    groupedHeatmap[item.laboratoryName][item.day] =
        item.utilizationPercentage;

});

//console.log("Logged in Role:", userRole);

  return (
    <>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Utilization Monitoring
      </Typography>

      <Grid container spacing={3}>

        {cards.map((card) => (

          <Grid
  size={{
    xs: 12,
    sm: 6,
    md: 4,
  }}
  key={card.title}
>
            <Card>

              <CardContent>

                <Typography color="text.secondary">
                  {card.title}
                </Typography>

                <Typography variant="h4">
                  {card.value}
                </Typography>

              </CardContent>

            </Card>

          </Grid>

        ))}

      </Grid>
  {(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN"
) && (

    <>
      <Typography
            variant="h5"
            fontWeight="bold"
            mt={5}
            mb={2}
        >
            Institution Utilization
        </Typography>

        <TableContainer component={Paper}>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>
                            Institution
                        </TableCell>

                        <TableCell align="center">
                            Total Equipment
                        </TableCell>

                        <TableCell align="center">
                            Utilization %
                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {institutionData.map((institution) => (

                        <TableRow key={institution.institutionId}>

                            <TableCell>
                                {institution.institutionName}
                            </TableCell>

                            <TableCell align="center">
                                {institution.totalEquipment}
                            </TableCell>

                            <TableCell align="center">
                                {institution.utilizationPercentage}%
                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>
        </>
)}

  {(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN" ||
    userRole === "DEPARTMENT_HEAD"
) && (
    <>
        <Typography
              variant="h5"
              fontWeight="bold"
              mt={5}
              mb={2}
          >
              Department Utilization
          </Typography>

          <TableContainer component={Paper}>

              <Table>

                  <TableHead>

                      <TableRow>

                          <TableCell>
                              Department
                          </TableCell>

                          <TableCell align="center">
                              Total Equipment
                          </TableCell>

                          <TableCell align="center">
                              Equipment In Use
                          </TableCell>

                          <TableCell align="center">
                              Utilization %
                          </TableCell>

                      </TableRow>

                  </TableHead>

                  <TableBody>

                      {departmentData.map((department) => (

                          <TableRow key={department.departmentName}>

                              <TableCell>
                                  {department.departmentName}
                              </TableCell>

                              <TableCell align="center">
                                  {department.totalEquipment}
                              </TableCell>

                              <TableCell align="center">
                                  {department.equipmentInUse}
                              </TableCell>

                              <TableCell align="center">
                                  {department.utilizationPercentage}%
                              </TableCell>

                          </TableRow>

                      ))}

                  </TableBody>

              </Table>

          </TableContainer>
          </>
)}

  {(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN" ||
    userRole === "DEPARTMENT_HEAD" ||
    userRole === "LAB_ASSISTANT"
) && (

    <>
          <Typography
                variant="h5"
                fontWeight="bold"
                mt={5}
                mb={2}
            >
                Peak Usage Analysis
            </Typography>

            <Paper
                sx={{
                    p: 2,
                    mb: 4,
                }}
            >

                <ResponsiveContainer
                    width="100%"
                    height={350}
                >

                    <BarChart data={peakUsageData}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="hour" />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="bookingCount"
                            radius={[8, 8, 0, 0]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </Paper>
            </>
)}

{(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN" ||
    userRole === "DEPARTMENT_HEAD" ||
    userRole === "LAB_ASSISTANT"
) && (
    <>

            <Typography
                variant="h5"
                fontWeight="bold"
                align="center"
                mt={5}
                mb={2}
            >
                Utilization Heatmap
            </Typography>

            <Box
    display="flex"
    justifyContent="center"
    gap={2}
    mb={3}
>

    <Chip
        label="Low (0–30%)"
        sx={{
            bgcolor: "#4CAF50",
            color: "white",
            fontWeight: "bold",
        }}
    />

    <Chip
        label="Medium (31–70%)"
        sx={{
            bgcolor: "#FF9800",
            color: "white",
            fontWeight: "bold",
        }}
    />

    <Chip
        label="High (71–100%)"
        sx={{
            bgcolor: "#F44336",
            color: "white",
            fontWeight: "bold",
        }}
    />

</Box>

<TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                    //overflow: "hidden",
                    mt: 2,
                }}
            >

                <Table stickyHeader>

                    <TableHead>

                        <TableRow
                            sx={{
                                "& th": {
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "15px",
                                },
                            }}
                        >

                            <TableCell>
                                <b>Laboratory</b>
                            </TableCell>

                            {days.map((day) => (

                                <TableCell
                                    align="center"
                                    key={day}
                                >
                                    <b>{day.substring(0,3)}</b>
                                </TableCell>

                            ))}

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {Object.keys(groupedHeatmap).map((lab) => (

                            <TableRow
                              key={lab}
                              sx={{"&:nth-of-type(odd)": {backgroundColor: "#fafafa",}, }} 
                              >

                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {lab}
                                </TableCell>

                                {days.map((day) => {

                                    const value =
                                        groupedHeatmap[lab][day] || 0;

                                    return (

                                        <TableCell
                                            align="center"
                                            key={day}
                                        >

                                            <Paper
                                            elevation={2}
                                            sx={{
                                                backgroundColor: getColor(value),
                                                color: "white",
                                                width: 38,
                                                height: 38,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                margin: "auto",
                                                borderRadius: "10px",
                                                fontWeight: "bold",
                                                fontSize: "13px",
                                                transition: "0.3s",
                                                "&:hover": {
                                                    transform: "scale(1.1)",
                                                },
                                            }}
                                        >
                                                {Math.round(value)}%

                                            </Paper>

                                        </TableCell>

                                    );

                                })}

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </TableContainer> 
                   </>
)
}

{(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN" ||
    userRole === "DEPARTMENT_HEAD" ||
    userRole === "LAB_ASSISTANT" ||
    userRole === "FACULTY"
) && (

    <>

    <Typography
    variant="h5"
    fontWeight="bold"
    mt={5}
    mb={2}
>
    Historical Utilization Trend
</Typography>

<Paper sx={{ p: 3, mb: 4 }}>

    <ResponsiveContainer width="100%" height={300}>

        <LineChart data={trendData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis
                domain={[0, 100]}
            />

            <Tooltip />

            <Line
                type="monotone"
                dataKey="utilizationPercentage"
                stroke="#1976d2"
                strokeWidth={3}
            />

        </LineChart>

    </ResponsiveContainer>

</Paper>
</>
)}

{(
    userRole === "SYSTEM_ADMIN" ||
    userRole === "INSTITUTE_ADMIN" ||
    userRole === "DEPARTMENT_HEAD" ||
    userRole === "LAB_ASSISTANT"
) && (

    <>

<Typography
    variant="h5"
    fontWeight="bold"
    mt={5}
    mb={2}
>
    Idle Equipment Alerts
</Typography>

<TableContainer component={Paper} sx={{ mb: 4 }}>

    <Table>

        <TableHead>

            <TableRow>

                <TableCell><b>Equipment</b></TableCell>

                <TableCell><b>Laboratory</b></TableCell>

                <TableCell><b>Institution</b></TableCell>

                <TableCell><b>Last Used</b></TableCell>

                <TableCell><b>Idle Days</b></TableCell>

                <TableCell><b>Status</b></TableCell>

            </TableRow>

        </TableHead>

        <TableBody>

            {idleEquipment.map((item) => (

                <TableRow key={item.equipmentId}>

                    <TableCell>
                        {item.equipmentName}
                    </TableCell>

                    <TableCell>
                        {item.laboratoryName}
                    </TableCell>

                    <TableCell>
                        {item.institutionName}
                    </TableCell>

                    <TableCell>
                        {item.lastUsed}
                    </TableCell>

                    <TableCell>

                        {item.idleDays == null
                            ? "-"
                            : item.idleDays}

                    </TableCell>

                    <TableCell>

                        <Chip

                            label={item.alert}

                            color={
                                item.alert === "Idle"
                                    ? "error"
                                    : item.alert === "Never Used"
                                        ? "warning"
                                        : "success"
                            }

                        />

                    </TableCell>

                </TableRow>

            ))}

        </TableBody>

    </Table>

</TableContainer>
 </>
)}

      <Typography
            variant="h5"
            fontWeight="bold"
            mt={5}
            mb={2}
        >
            Equipment Utilization
        </Typography>

        <TableContainer component={Paper}>

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell><b>Equipment</b></TableCell>

                        <TableCell><b>Laboratory</b></TableCell>

                        <TableCell><b>Institution</b></TableCell>

                        <TableCell><b>Quantity</b></TableCell>

                        <TableCell><b>Status</b></TableCell>

                        <TableCell><b>Utilization %</b></TableCell>

                        <TableCell><b>Last Used</b></TableCell>

                        <TableCell><b>Idle Time</b></TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {equipmentList.map((equipment) => (

                        <TableRow key={equipment.equipmentId}>

                            <TableCell>
                                {equipment.equipmentName}
                            </TableCell>

                            <TableCell>
                                {equipment.laboratoryName}
                            </TableCell>

                            <TableCell>
                                {equipment.departmentName}
                            </TableCell>

                            <TableCell>
                                {equipment.quantity}
                            </TableCell>

                            <TableCell>

                                <Chip
                                    label={equipment.status}
                                    color={
                                        equipment.status === "Available"
                                            ? "success"
                                            : "error"
                                    }
                                />

                            </TableCell>

                            <TableCell>
                                {equipment.utilizationPercentage}%
                            </TableCell>

                            <TableCell>
                                {equipment.lastUsed}
                            </TableCell>

                            <TableCell>
                                {equipment.idleTime}
                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

        </TableContainer>

    </>
  );

}

export default Utilization;