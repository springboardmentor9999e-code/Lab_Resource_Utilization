/**
 * Utility functions for exporting dashboard data to PDF and Excel (CSV).
 */

/**
 * Downloads data as an Excel-compatible CSV file.
 * @param {string} filename - Desired filename without extension.
 * @param {Array<{ key: string, label: string }>} columns - Columns configuration.
 * @param {Array<Object>} data - Array of row objects.
 */
export const downloadExcel = (filename = "dashboard-report", columns = [], data = []) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Headers
  const headers = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`).join(",");

  // Rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (val === null || val === undefined) val = "";
        if (typeof val === "object") val = JSON.stringify(val);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads/Prints a formatted PDF report.
 * @param {string} title - Title of the report.
 * @param {Array<{ key: string, label: string }>} columns - Table column definitions.
 * @param {Array<Object>} data - Data rows.
 * @param {Object} summaryMetrics - Key-value pair of summary metrics to feature at top.
 */
export const downloadPDF = (title = "Dashboard Report", columns = [], data = [], summaryMetrics = {}) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the PDF report.");
    return;
  }

  const dateStr = new Date().toLocaleString();

  const metricsHtml = Object.entries(summaryMetrics)
    .map(
      ([key, val]) => `
      <div style="background: #f1f5f9; padding: 12px 18px; border-radius: 8px; flex: 1; min-width: 140px;">
        <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600;">${key}</div>
        <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px;">${val}</div>
      </div>
    `
    )
    .join("");

  const tableHeadersHtml = columns.map((c) => `<th style="padding: 10px 14px; text-align: left; background: #1e293b; color: white; font-weight: 600; border-bottom: 2px solid #e2e8f0;">${c.label}</th>`).join("");

  const tableRowsHtml = data
    .map(
      (row, idx) => `
      <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"}; border-bottom: 1px solid #e2e8f0;">
        ${columns
          .map((col) => {
            let val = row[col.key];
            if (val === null || val === undefined) val = "-";
            if (typeof val === "boolean") val = val ? "Yes" : "No";
            return `<td style="padding: 10px 14px; font-size: 13px; color: #334155;">${val}</td>`;
          })
          .join("")}
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Lab Resource Utilization</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 30px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; color: #1e3a8a; }
          .header .date { font-size: 12px; color: #64748b; }
          .metrics { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <div style="font-size: 13px; color: #475569; margin-top: 4px;">Lab Resource Utilization System</div>
          </div>
          <div class="date">Generated on: ${dateStr}</div>
        </div>

        ${metricsHtml ? `<div class="metrics">${metricsHtml}</div>` : ""}

        <table>
          <thead>
            <tr>${tableHeadersHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Confidential - Internal Lab Management Report • Generated automatically
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export default {
  downloadExcel,
  downloadPDF,
};
