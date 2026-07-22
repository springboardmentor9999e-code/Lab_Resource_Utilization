import { apiClient } from "./client";

export const bookingsApi = {
  list: () => apiClient.get("/api/bookings").then((r) => r.data),
  get: (id) => apiClient.get(`/api/bookings/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/bookings", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/bookings/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/bookings/${id}`),
  waitlistFor: (equipmentId) =>
    apiClient.get(`/api/bookings/waitlist/${equipmentId}`).then((r) => r.data),
};
