import { Outlet } from "react-router-dom";

function InstitutionLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "25px",
      }}
    >
      <Outlet />
    </div>
  );
}

export default InstitutionLayout;