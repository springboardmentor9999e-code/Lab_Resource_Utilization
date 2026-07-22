import { apiClient } from "./client";

// Backend Maintenance fields: maintenanceId, equipment (required), startDate
// (required, LocalDate e.g. "2026-07-20"), endDate (optional), description
// (optional), status (optional, free-text - no enum/CHECK constraint on backend).
export const maintenanceApi = {
  list: () => apiClient.get("/api/maintenance").then((r) => r.data),
  get: (id) => apiClient.get(`/api/maintenance/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post("/api/maintenance", payload).then((r) => r.data),
  update: (id, payload) => apiClient.put(`/api/maintenance/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/maintenance/${id}`),
};
