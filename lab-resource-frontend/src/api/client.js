import axios from "axios";

// Base URL for the Spring Boot backend. Override with VITE_API_BASE_URL in a
// .env file if the backend runs somewhere other than localhost:8080.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiClient = axios.create({ baseURL });

// Attach the JWT to every request once the user is logged in.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("lrp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected/expired, force the user back to login rather than
// leaving them staring at a broken dashboard.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lrp_token");
      localStorage.removeItem("lrp_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
