import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

function ReportsBarChart({
        data,
        title = "Platform Statistics",
        xKey = "name",
        barKey = "value"
    }) {

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
                {title}
            </h2>

            <div
                style={{
                    flex: 1
                }}
            >

                <ResponsiveContainer
                    width="100%"
                    height="80%"
                >

                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 20,
                            right: 10,
                            left: 10,
                            bottom: 10
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis type="number" />

                        <YAxis
                            type="category"
                            dataKey={xKey}
                            width={140}
                        />

                        <Tooltip />

                        <Bar
                            dataKey={barKey}
                            fill="#1976d2"
                            radius={[0, 8, 8, 0]}
                             barSize={21}
                        />
                    </BarChart>
                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default ReportsBarChart;