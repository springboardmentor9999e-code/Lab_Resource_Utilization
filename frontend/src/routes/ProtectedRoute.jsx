import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const { isAuthenticated, hasRole, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRoles && !requiredRoles.some(role => user?.roles?.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
