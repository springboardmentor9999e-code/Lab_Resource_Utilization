import { apiClient } from "./client";

// Backend Notification fields: notificationId, recipient, type ("Idle
// Equipment" | "Maintenance Due" | "Calibration Due"), message, equipment
// (optional, for deep-linking), isRead, createdAt. Always scoped to the
// current authenticated user - there's no way to fetch anyone else's.
export const notificationsApi = {
  list: (unreadOnly) =>
    apiClient.get("/api/notifications", { params: unreadOnly ? { unreadOnly: true } : undefined }).then((r) => r.data),
  markRead: (id) => apiClient.put(`/api/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.put("/api/notifications/read-all"),
};
