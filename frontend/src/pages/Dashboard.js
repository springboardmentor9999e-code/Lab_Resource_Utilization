import Sidebar from "../components/Sidebar";

function Dashboard() {
  const fullName = localStorage.getItem("fullName");
const firstName = fullName ? fullName.split(" ")[0] : "User";
    return (

        <div
            style={{
                display: "flex"
            }}
        >

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>Lab Resource Utilization Platform</h1>

                <hr />

                <h2>Dashboard</h2>
                <h3>Welcome {firstName} 👋</h3>

                <p>

                    This is the dashboard of the Lab Resource Utilization Platform.

                </p>

            </div>

        </div>

    );

}

export default Dashboard;