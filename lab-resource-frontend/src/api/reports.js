import { apiClient } from "./client";

// Downloads the utilization/cost analysis report as a PDF and triggers a
// browser save-as, rather than returning JSON like every other endpoint -
// needs responseType: "blob" so axios doesn't try to parse the binary PDF
// bytes as JSON, and needs to read the filename the backend sets via the
// Content-Disposition header rather than inventing one client-side.
export const reportsApi = {
  downloadUtilizationCostReport: async ({ from, to } = {}) => {
    const response = await apiClient.get("/api/reports/utilization-cost-analysis", {
      params: { from, to },
      responseType: "blob",
    });

    const disposition = response.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : "lab-report.pdf";

    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
