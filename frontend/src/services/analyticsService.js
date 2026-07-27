import api from './api';

export const analyticsService = {
  // Role-aware dashboard payload: { role, common, personal, manager?, admin? }
  getDashboard: async (days = 30) => {
    const response = await api.get('/analytics/dashboard', { params: { days } });
    return response.data;
  },
};

export default analyticsService;
