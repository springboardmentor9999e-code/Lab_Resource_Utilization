import api from "./api";

// Fetch Researcher Dashboard Data (GET /api/dashboard/researcher)
export const getResearcherDashboard = async (userId) => {
  const response = await api.get("/dashboard/researcher", {
    params: userId ? { userId } : {},
  });
  return response.data;
};

// Fetch Manager Dashboard Data (GET /api/dashboard/manager)
export const getManagerDashboard = async () => {
  const response = await api.get("/dashboard/manager");
  return response.data;
};

// Fetch Admin Dashboard Data (GET /api/dashboard/admin)
export const getAdminDashboard = async () => {
  const response = await api.get("/dashboard/admin");
  return response.data;
};

// Legacy / General Utilization Data (GET /api/dashboard/utilization)
export const getUtilization = async () => {
  const response = await api.get("/dashboard/utilization");
  return response.data;
};

export default {
  getResearcherDashboard,
  getManagerDashboard,
  getAdminDashboard,
  getUtilization,
};
