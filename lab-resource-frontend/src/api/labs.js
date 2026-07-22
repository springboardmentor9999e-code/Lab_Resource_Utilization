import { apiClient } from "./client";

export const labsApi = {
  // params: { institutionId } — optional.
  list: (params) => apiClient.get("/api/labs", { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/api/labs/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/labs", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/labs/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/labs/${id}`),
};
