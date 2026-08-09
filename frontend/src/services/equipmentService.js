import api from '../api/client.js';

export async function getEquipment(filters = {}) {
  const response = await api.get('/equipment', {
    params: {
      labId: filters.labId || undefined,
      status: filters.status || undefined,
    },
  });

  return response.data;
}

export async function createEquipment(request) {
  const response = await api.post('/equipment', request);
  return response.data;
}

export async function updateEquipment(id, request) {
  const response = await api.put(`/equipment/${id}`, request);
  return response.data;
}

export async function deleteEquipment(id) {
  await api.delete(`/equipment/${id}`);
}
