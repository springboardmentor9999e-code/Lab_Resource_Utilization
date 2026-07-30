import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('labhub_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('labhub_token'));

  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password });
    const { data } = response.data;
    localStorage.setItem('labhub_token', data.token);
    localStorage.setItem('labhub_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const response = await authService.register(formData);
    const { data } = response.data;
    localStorage.setItem('labhub_token', data.token);
    localStorage.setItem('labhub_user', JSON.stringify(data));
    setToken(data.token);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('labhub_token');
    localStorage.removeItem('labhub_user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  const isAdmin = hasRole('SYSTEM_ADMIN') || hasRole('INSTITUTION_ADMIN');
  const isLabManager = hasRole('LAB_MANAGER');
  const canManageEquipment = isAdmin || isLabManager;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, hasRole, isAdmin, canManageEquipment }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
