import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token (never on public auth endpoints —
// a stale token must not interfere with login/register/OTP flows)
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password', '/auth/refresh-token'];

api.interceptors.request.use(
  (config) => {
    const isAuthPath = AUTH_PATHS.some((p) => config.url?.startsWith(p));
    if (isAuthPath) {
      delete config.headers.Authorization;
      return config;
    }
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if error is 401 Unauthorized and not already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Attempt token refresh via endpoint (backend returns AuthResponse: accessToken + refreshToken)
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          if (response.data && response.data.accessToken) {
            localStorage.setItem('token', response.data.accessToken);
            if (response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refreshToken);
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Clear tokens and let context handle logout/redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
