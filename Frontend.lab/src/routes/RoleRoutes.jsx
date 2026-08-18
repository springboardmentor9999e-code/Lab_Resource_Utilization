import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function RoleRoutes({ allowedRoles }) {
  const role = localStorage.getItem("role") || "";
  const normalizedRole = role.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "_");

  // Normalize allowedRoles to match comparison formatting
  const hasAccess = allowedRoles.some((allowed) => {
    const normAllowed = allowed.toUpperCase().replace(/^ROLE_?/, "").replace(/[\s_]+/g, "_");
    return normAllowed === normalizedRole;
  });

  if (!hasAccess) {
    console.warn(`RoleRoutes: Access denied for role "${role}".`);
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
