import { apiClient } from "./client";

// Backend SharingRequest fields: id, equipment, requesterInstitution,
// ownerInstitution, requestedBy, status (PENDING|APPROVED|REJECTED|CANCELLED|WAITLISTED),
// purpose, startDate, endDate, approvedBy, booking, createdAt, updatedAt.
// `booking` is only set when this request was auto-logged from someone booking
// another institution's equipment directly, rather than submitted for review -
// see BookingService.logSharingRequestIfCrossInstitution on the backend.
export const sharingRequestsApi = {
  list: () => apiClient.get("/api/sharing-requests").then((r) => r.data),
  create: (payload) => apiClient.post("/api/sharing-requests", payload).then((r) => r.data),
  approve: (id) => apiClient.put(`/api/sharing-requests/${id}/approve`).then((r) => r.data),
  reject: (id) => apiClient.put(`/api/sharing-requests/${id}/reject`).then((r) => r.data),
};
