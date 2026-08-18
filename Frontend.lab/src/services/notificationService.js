import api from "./api";

const notificationService = {
  // Phase 3: Get all notifications
  getNotifications: async (userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.get("/notifications", { params });
    return response.data || [];
  },

  // Get unread notifications & count
  getUnreadNotifications: async (userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.get("/notifications/unread", { params });
    return response.data || { notifications: [], unreadCount: 0 };
  },

  // Phase 7: Mark notification as read (PUT /api/notifications/{id}/read)
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read (PUT /api/notifications/read-all)
  markAllAsRead: async (userId = null) => {
    const params = userId ? { userId } : {};
    const response = await api.put("/notifications/read-all", null, { params });
    return response.data;
  },

  // Phase 8: Delete notification (DELETE /api/notifications/{id})
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Create notification
  createNotification: async (notificationData) => {
    const response = await api.post("/notifications", notificationData);
    return response.data;
  },
};

export default notificationService;
