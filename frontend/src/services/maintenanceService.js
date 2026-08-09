import api from '../api/client.js';

export async function getMaintenanceRecords() {
  const response = await api.get('/maintenance');
  return response.data;
}

export async function createMaintenance(request) {
  const response = await api.post('/maintenance', request);
  return response.data;
}

export async function updateMaintenance(id, request) {
  const response = await api.put(`/maintenance/${id}`, request);
  return response.data;
}

export async function startMaintenance(id) {
  const response = await api.patch(`/maintenance/${id}/start`);
  return response.data;
}

export async function completeMaintenance(id) {
  const response = await api.patch(`/maintenance/${id}/complete`);
  return response.data;
}

export async function cancelMaintenance(id) {
  const response = await api.patch(`/maintenance/${id}/cancel`);
  return response.data;
}
