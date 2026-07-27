import api from './api';

export const notificationService = {
  getMy: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count ?? 0;
  },
  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // Channel preferences. Email is always on; SMS and push are opt-out, and the
  // backend also reports phoneOnFile so the UI can explain a disabled SMS toggle.
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },
  // Omitted channels are left untouched by the backend, so send only what changed.
  updatePreferences: async (changes) => {
    const response = await api.patch('/notifications/preferences', changes);
    return response.data;
  },

  registerDevice: async (token, platform = 'WEB') => {
    const response = await api.post('/notifications/device-tokens', { token, platform });
    return response.data;
  },
  unregisterDevice: async (token) => {
    const response = await api.delete('/notifications/device-tokens', { params: { token } });
    return response.data;
  },
};

export default notificationService;
