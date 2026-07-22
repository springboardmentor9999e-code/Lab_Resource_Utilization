import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { can } from "./permissions";

// Guards a route using the same can() checks that decide sidebar visibility,
// so typing the URL directly can't bypass what the nav already hides.
// `requires` is the primary permission; `allowAlso` is an optional list of
// alternate permissions that also grant access (the route is visible if ANY
// of them pass) - e.g. Users is visible to full user-managers AND to
// DEPARTMENT_HEAD's narrower own-institution view.
export function PermissionRoute({ requires, allowAlso = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permitted = !requires
    || can(user.role, requires)
    || allowAlso.some((action) => can(user.role, action));

  if (!permitted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
