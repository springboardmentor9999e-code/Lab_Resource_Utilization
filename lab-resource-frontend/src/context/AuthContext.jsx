import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const response = await authApi.login({ email, password, rememberMe });
    const data = response.data;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const userData = {
      userId: data.userId,
      email: data.email,
      role: data.role,
      fullName: data.fullName,
      institutionId: data.institutionId || null,
      departmentId: data.departmentId || null,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const register = async (formData) => {
    await authApi.register(formData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Logout even if API fails
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated, isAdmin, isSystemAdmin, isInstitutionAdmin, isDepartmentHead, isManager, isTechnician }}>
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
