import { apiClient } from "./client";

export const equipmentApi = {
  // params: { labId, institutionId } — both optional.
  list: (params) => apiClient.get("/api/equipment", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/api/equipment/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/equipment", payload).then((r) => r.data),
  updateStatus: (id, status) =>
    apiClient.patch(`/api/equipment/${id}/status`, { status }).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/equipment/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/equipment/${id}`),
};
