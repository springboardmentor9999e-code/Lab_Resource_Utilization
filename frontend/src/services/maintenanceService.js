import api from './api';

export const maintenanceService = {
  // Work orders
  createRequest: async (data) => {
    const response = await api.post('/maintenance/requests', data);
    return response.data;
  },
  getRequests: async () => {
    const response = await api.get('/maintenance/requests');
    return response.data;
  },
  getMyAssigned: async () => {
    const response = await api.get('/maintenance/requests/my-assigned');
    return response.data;
  },
  assign: async (id, technicianId) => {
    const response = await api.patch(`/maintenance/requests/${id}/assign`, null, {
      params: { technicianId },
    });
    return response.data;
  },
  updateStatus: async (id, status, resolutionNotes, cost) => {
    const params = { status };
    if (resolutionNotes) params.resolutionNotes = resolutionNotes;
    if (cost !== undefined && cost !== null && cost !== '') params.cost = cost;
    const response = await api.patch(`/maintenance/requests/${id}/status`, null, { params });
    return response.data;
  },
  getTechnicians: async () => {
    const response = await api.get('/maintenance/technicians');
    return response.data;
  },

  // Calibration
  addCalibration: async (data) => {
    const response = await api.post('/maintenance/calibrations', data);
    return response.data;
  },
  getCalibrations: async (equipmentId = null) => {
    const response = await api.get('/maintenance/calibrations', {
      params: equipmentId ? { equipmentId } : {},
    });
    return response.data;
  },
  getExpiring: async (days = 30) => {
    const response = await api.get('/maintenance/calibrations/expiring', { params: { days } });
    return response.data;
  },

  // Preventive schedules
  createSchedule: async (data) => {
    const response = await api.post('/maintenance/schedules', data);
    return response.data;
  },
  getSchedules: async () => {
    const response = await api.get('/maintenance/schedules');
    return response.data;
  },
  toggleSchedule: async (id) => {
    const response = await api.patch(`/maintenance/schedules/${id}/toggle`);
    return response.data;
  },

  getSummary: async () => {
    const response = await api.get('/maintenance/summary');
    return response.data;
  },
};

export default maintenanceService;
