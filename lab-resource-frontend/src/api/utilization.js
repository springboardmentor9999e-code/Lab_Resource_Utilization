import { apiClient } from "./client";

export const utilizationApi = {
  rate: (equipmentId, from, to) =>
    apiClient
      .get(`/api/utilization/equipment/${equipmentId}/rate`, { params: { from, to } })
      .then((r) => r.data),
  heatmap: (from, to) =>
    apiClient.get("/api/utilization/heatmap", { params: { from, to } }).then((r) => r.data),
  idle: () => apiClient.get("/api/utilization/idle").then((r) => r.data),
};
