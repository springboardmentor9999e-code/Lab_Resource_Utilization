import axios from "axios";

// Create Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Automatically attach the JWT token to authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized redirects)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Session expired or unauthorized request. Clearing auth credentials.");
        
        // Remove authentication items from storage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("email");
        
        // Redirect to login page if currently on a protected route without looping
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          if (!window.isRedirectingToLogin) {
            window.isRedirectingToLogin = true;
            window.location.href = "/login";
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;