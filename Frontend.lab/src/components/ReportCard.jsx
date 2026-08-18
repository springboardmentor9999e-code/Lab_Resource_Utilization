import React from "react";
import { Paper, Box, Typography, Button, Stack, Chip } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import ArticleIcon from "@mui/icons-material/Article";
import { downloadPDF, downloadExcel } from "../utils/exportUtils";

export default function ReportCard({
  title = "Resource Utilization Report",
  description = "Detailed report on equipment usage, maintenance logs, and booking trends.",
  badge = "Monthly",
  columns = [
    { key: "item", label: "Equipment / Lab" },
    { key: "department", label: "Department" },
    { key: "hoursUsed", label: "Hours Used" },
    { key: "utilization", label: "Utilization Rate" },
    { key: "status", label: "Status" },
  ],
  data = [
    { item: "NMR Spectrometer 400MHz", department: "Chemistry", hoursUsed: 145, utilization: "85%", status: "Active" },
    { item: "High-Speed Centrifuge B7", department: "Biology", hoursUsed: 110, utilization: "72%", status: "Active" },
    { item: "Electron Microscope Zeiss", department: "Physics", hoursUsed: 180, utilization: "92%", status: "High Demand" },
    { item: "Thermal Cycler PCR", department: "Bioengineering", hoursUsed: 65, utilization: "45%", status: "Available" },
  ],
  metrics = {
    "Total Report Items": "4 Labs",
    "Average Utilization": "73.5%",
    "Report Period": "Current Month",
  },
}) {
  const handleExportPDF = () => {
    downloadPDF(title, columns, data, metrics);
  };

  const handleExportExcel = () => {
    downloadExcel(title.toLowerCase().replace(/\s+/g, "-"), columns, data);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        },
      }}
    >
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArticleIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            </Box>
          </Box>
          {badge && <Chip label={badge} color="primary" variant="outlined" size="small" sx={{ fontWeight: 700 }} />}
        </Box>

        {/* Featured Metrics */}
        {metrics && (
          <Box display="flex" gap={1.5} flexWrap="wrap" my={2} sx={{ bgcolor: "action.hover", p: 1.5, borderRadius: 2 }}>
            {Object.entries(metrics).map(([key, val]) => (
              <Box key={key} sx={{ flex: 1, minWidth: 100 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem", fontWeight: 600 }}>
                  {key}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {val}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={1.5} mt={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleExportPDF}
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Download PDF
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<TableChartIcon />}
          onClick={handleExportExcel}
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Download Excel
        </Button>
      </Stack>
    </Paper>
  );
}
