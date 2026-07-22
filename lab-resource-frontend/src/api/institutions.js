import { apiClient } from "./client";

export const institutionsApi = {
  list: () => apiClient.get("/api/institutions").then((r) => r.data),
  get: (id) => apiClient.get(`/api/institutions/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/institutions", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/institutions/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/institutions/${id}`),
};
