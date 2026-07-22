import { apiClient } from "./client";

// Backend SharingRequest fields: id, equipment, requesterInstitution,
// ownerInstitution, requestedBy, status (PENDING|APPROVED|REJECTED|CANCELLED),
// purpose, startDate, endDate, approvedBy, createdAt, updatedAt.
export const sharingRequestsApi = {
  list: () => apiClient.get("/api/sharing-requests").then((r) => r.data),
  create: (payload) => apiClient.post("/api/sharing-requests", payload).then((r) => r.data),
  approve: (id) => apiClient.put(`/api/sharing-requests/${id}/approve`).then((r) => r.data),
  reject: (id) => apiClient.put(`/api/sharing-requests/${id}/reject`).then((r) => r.data),
};
