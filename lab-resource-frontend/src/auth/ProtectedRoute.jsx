import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

// Wrap routes that require login. Optionally restrict to a set of roles.
export function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
