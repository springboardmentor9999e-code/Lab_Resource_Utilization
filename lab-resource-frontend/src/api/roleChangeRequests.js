import { apiClient } from "./client";

// Backend RoleChangeRequest fields: id, user, requestedRole, status
// (PENDING|APPROVED|REJECTED), reviewedBy, createdAt, reviewedAt.
export const roleChangeRequestsApi = {
  listPending: () => apiClient.get("/api/role-change-requests/pending").then((r) => r.data),
  approve: (id) => apiClient.put(`/api/role-change-requests/${id}/approve`).then((r) => r.data),
  reject: (id) => apiClient.put(`/api/role-change-requests/${id}/reject`).then((r) => r.data),
};
