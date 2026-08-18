import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api",
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token automatically if it exists in local storage
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

// Response Interceptor: Catch unauthorized access (expired JWT token) globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If response status is 401 Unauthorized (expired or invalid token)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized token detected. Logging out...");
      
      // Clear all authentication values from storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      
      // Force reload page to redirect user without looping
      if (!window.isRedirectingToLogin) {
        window.isRedirectingToLogin = true;
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;