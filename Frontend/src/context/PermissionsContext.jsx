import React, { createContext, useContext, useState, useEffect } from 'react';

const PermissionsContext = createContext();

export const PermissionsProvider = ({ children, user }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user && user.permissions) {
      setPermissions(user.permissions);
    } else {
      setPermissions([]);
    }
  }, [user]);

  const hasPermission = (permissionName) => {
    return permissions.includes(permissionName);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionsContext);
};
