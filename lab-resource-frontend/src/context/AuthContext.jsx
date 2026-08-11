import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

const toUser = (d) => ({
  userId: d.userId,
  email: d.email,
  role: d.role,
  fullName: d.fullName,
  institutionId: d.institutionId || null,
  departmentId: d.departmentId || null,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await authApi.getMe();
      setUser(toUser(res.data));
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    checkAuth().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const response = await authApi.login({ email, password, rememberMe });
    setUser(toUser(response.data));
    return response.data;
  };

  const register = async (formData) => {
    await authApi.register(formData);
  };

  const completeOAuthProfile = async (payload) => {
    const response = await authApi.completeOAuthProfile(payload);
    setUser(toUser(response.data));
    return response.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Logout even if API fails
    }
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';
  const isInstitutionAdmin = user?.role === 'INSTITUTION_ADMIN';
  const isAdmin = isSystemAdmin || isInstitutionAdmin;
  const isDepartmentHead = user?.role === 'DEPARTMENT_HEAD';
  const isTechnician = user?.role === 'LAB_TECHNICIAN';
  const isManager = user?.role === 'LAB_MANAGER' || isDepartmentHead || isAdmin;

  return (
    <AuthContext.Provider value={{ user, login, register, completeOAuthProfile, logout, loading, isAuthenticated, isAdmin, isSystemAdmin, isInstitutionAdmin, isDepartmentHead, isManager, isTechnician, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
