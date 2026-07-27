import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { can, getPrimaryRole } from '../utils/permissions';

/**
 * Route guard. Blocks unauthenticated users, and — when `permission` is given —
 * also blocks authenticated users whose roles do not grant it.
 *
 * The sidebar already hides admin-only links, but hiding a link is not access
 * control: without this check a researcher could reach /dashboard/users just by
 * typing the URL. The backend still rejects the API calls, so the page would
 * merely render empty; this turns that into an explicit refusal.
 *
 * props: children, permission (a key from utils/permissions)
 */
const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save current path to redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !can(user, permission)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="glass-card dark:glass-card-dark max-w-md rounded-2xl border border-slate-200/50 p-8 text-center dark:border-slate-800/50">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="my-0 font-heading text-lg font-extrabold text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Your role ({getPrimaryRole(user).replace(/_/g, ' ')}) does not have permission to view
            this page. Contact a system administrator if you need access.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-95"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
