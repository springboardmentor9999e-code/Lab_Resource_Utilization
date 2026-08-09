import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { getFirstPermittedPath, canAccessPath } from '../auth/permissions.js';
import { clearSession, getStoredUser, getToken } from '../auth/session.js';

export default function RequireAuth() {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user) {
    clearSession();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessPath(user, location.pathname)) {
    return <Navigate to={getFirstPermittedPath(user)} replace />;
  }

  return <Outlet />;
}
