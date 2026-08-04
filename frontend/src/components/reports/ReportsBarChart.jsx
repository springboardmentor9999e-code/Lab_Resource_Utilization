import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function ReportsBarChart({ data }) {

    return (

        <div
            style={{
                background: "#fff",
                borderRadius: 18,
                padding: 20,
                height: 500,
                display: "flex",
                flexDirection: "column"
            }}
        >

            <h2
                style={{
                    margin: 0,
                    marginBottom: 20,
                    textAlign: "center",
                    fontSize: "22px",
                    fontWeight: 600
                }}
            >
                Platform Statistics
            </h2>

            <div
                style={{
                    flex: 1
                }}
            >

                <ResponsiveContainer
                    width="100%"
                    height="82%"
                >

                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 20,
                            left: 0,
                            bottom: 40
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="name"
                            angle={-15}
                            textAnchor="end"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="value"
                            fill="#1976d2"
                            radius={[8,8,0,0]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default ReportsBarChart;