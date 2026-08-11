import { apiClient } from "./client";

// Backend CalibrationRecord fields: calibrationRecordId, equipment (required),
// calibratedDate (required, e.g. "2026-07-20"), expiryDate (required),
// certificationStandard (optional), certificateUrl (optional), performedBy
// (optional), notes (optional), createdAt.
export const calibrationRecordsApi = {
  historyFor: (equipmentId) =>
    apiClient.get(`/api/calibration-records/equipment/${equipmentId}`).then((r) => r.data),
  // daysAhead defaults to 30 on the backend if omitted.
  reminders: (daysAhead) =>
    apiClient
      .get("/api/calibration-records/reminders", { params: daysAhead ? { daysAhead } : undefined })
      .then((r) => r.data),
  create: (payload) => apiClient.post("/api/calibration-records", payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/api/calibration-records/${id}`),
};
