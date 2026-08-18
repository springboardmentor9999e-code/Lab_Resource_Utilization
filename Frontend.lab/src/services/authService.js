import api from "./api";

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response;
  },
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  forgotPassword: async (email) => {
    // If forgot-password endpoint is supported by backend, connect to it
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
};

export default authService;
