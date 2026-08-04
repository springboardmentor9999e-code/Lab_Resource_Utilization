import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";

const COLORS = [
    "#1976d2",
    "#43a047",
    "#fb8c00",
    "#8e24aa",
    "#e53935",
    "#00acc1"
];

function ReportsChart({ data, title }) {

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
                    height="82%"
                >

                    <PieChart>

                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            outerRadius={115}
                            innerRadius={65}
                            paddingAngle={2}
                        >

                            {data.map((entry, index) => (

                                <Cell
                                    key={index}
                                    fill={COLORS[index % COLORS.length]}
                                />

                            ))}

                        </Pie>

                        <Tooltip />

                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            iconSize={10}
                            wrapperStyle={{
                                fontSize: "13px",
                                paddingTop: "10px"
                            }}
                        />

                    </PieChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

}

export default ReportsChart;