import api from './api';

export const utilizationService = {
  getSummary: async (days = 30) => {
    const response = await api.get('/utilization/summary', { params: { days } });
    return response.data;
  },
  getHeatmap: async (days = 42, equipmentId = null) => {
    const params = { days };
    if (equipmentId) params.equipmentId = equipmentId;
    const response = await api.get('/utilization/heatmap', { params });
    return response.data;
  },
  getIdle: async (idleDays = 14) => {
    const response = await api.get('/utilization/idle', { params: { idleDays } });
    return response.data;
  },
  getEquipmentUtilization: async (id, days = 30) => {
    const response = await api.get(`/utilization/equipment/${id}`, { params: { days } });
    return response.data;
  },
  // Demand-side view: what was requested vs what capacity existed, and what was turned away
  getDemand: async (days = 30) => {
    const response = await api.get('/utilization/demand', { params: { days } });
    return response.data;
  },
  getPeakUsage: async (days = 42, equipmentId = null) => {
    const params = { days };
    if (equipmentId) params.equipmentId = equipmentId;
    const response = await api.get('/utilization/peak', { params });
    return response.data;
  },
};

export default utilizationService;
