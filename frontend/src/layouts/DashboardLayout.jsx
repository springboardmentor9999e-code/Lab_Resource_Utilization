import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

function DashboardLayout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f5f7fb",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          marginLeft: "240px",
        }}
      >
        <Navbar />

        <div
          style={{
            padding: "25px",
            marginTop: "70px",
            width: "100%",
            minHeight: "calc(100vh - 70px)",
            background: "#f5f7fb",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;