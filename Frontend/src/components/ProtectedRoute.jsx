import React from 'react';
import { usePermissions } from '../context/PermissionsContext';

const ProtectedRoute = ({ requiredPermission, children }) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(requiredPermission)) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 font-bold text-lg">Access Denied</p>
        <p className="text-gray-600 mt-2">You do not have permission to view this content.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
