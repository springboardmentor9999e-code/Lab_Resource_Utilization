import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_SCREEN_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthScreen = AUTH_SCREEN_ENDPOINTS.some((e) => url.includes(e));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthScreen) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => {
              refreshPromise = null;
            });
        }
        await refreshPromise;
        return api(originalRequest);
      } catch (refreshError) {
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/oauth2/'];
        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some(p => currentPath === p || currentPath.startsWith(p));
        
        if (!isPublicPath) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
