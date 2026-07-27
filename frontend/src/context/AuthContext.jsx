import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session load
    const loadSession = () => {
      const persistedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      const persistedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (persistedToken && persistedUser) {
        try {
          setToken(persistedToken);
          setUser(JSON.parse(persistedUser));
        } catch (e) {
          console.error("Error loading persisted session:", e);
          clearSession();
        }
      }
      setLoading(false);
    };

    loadSession();

    // Listen to token expiration events from Axios interceptor
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const login = async (username, password, rememberMe = false) => {
    try {
      const data = await authService.login(username, password);
      
      // Fetch user profile from /users/me
      const profile = await authService.getCurrentUser(data.token);
      
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', data.token);
      storage.setItem('refreshToken', data.refreshToken);
      storage.setItem('user', JSON.stringify(profile));
      
      setToken(data.token);
      setUser(profile);
      return profile;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const loginWithGoogle = async (idToken, role) => {
    try {
      const data = await authService.googleAuth(idToken, role);

      // Fetch user profile from /users/me
      const profile = await authService.getCurrentUser(data.token);

      // Google sessions persist like "remember me"
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(profile));

      setToken(data.token);
      setUser(profile);
      return profile;
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearSession();
  };

  const value = {
    user,
    setUser,
    token,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
