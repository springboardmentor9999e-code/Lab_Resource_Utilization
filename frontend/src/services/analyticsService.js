import api from '../api/client.js';

export async function getDashboardSummary() {
  const response = await api.get('/analytics/dashboard');
  return response.data;
}

export async function getAnalyticsOverview(from, to) {
  const response = await api.get('/analytics/overview', {
    params: { from, to },
  });

  return response.data;
}
