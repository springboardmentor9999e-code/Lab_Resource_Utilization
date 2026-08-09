import api from '../api/client.js';

export async function getLabs() {
  const response = await api.get('/labs');
  return response.data;
}
