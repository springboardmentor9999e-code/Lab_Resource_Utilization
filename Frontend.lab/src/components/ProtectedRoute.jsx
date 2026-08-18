import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "";

  // If no token exists, redirect to login path
  if (!token || token.trim() === "") {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user's role is authorized
  if (allowedRoles && allowedRoles.length > 0) {
    const normUserRole = role.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "");
    const hasRole = allowedRoles.some((r) => {
      const normR = r.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "");
      return normR === normUserRole;
    });
    if (!hasRole) {
      console.warn(`Access denied. Role "${role}" is not authorized for this view.`);
      if (window.location.pathname === "/dashboard") {
        return <Navigate to="/login" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}