import api from '../api/client.js';

export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

export async function getUser(id) {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

export async function updateUserRole(id, role) {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
}
