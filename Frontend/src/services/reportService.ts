import api from "./api";

/** Aligned with ReportsController + ReportDTO. */
export interface Report {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  sizeBytes: number;
}

export const listReports = () =>
  api.get<Report[]>("/api/reports").then((r) => r.data);

/** Returns a CSV blob; caller triggers download. */
export const exportReport = (type: string) =>
  api.get(`/api/reports/export/${type}`, { responseType: "blob" }).then((r) => r.data as Blob);

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
