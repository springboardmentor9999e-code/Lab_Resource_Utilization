import React from "react";
import { Paper, Box, FormControl, InputLabel, Select, MenuItem, Button, Typography, Stack } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export default function DashboardFilter({
  dateFilter,
  setDateFilter,
  departmentFilter,
  setDepartmentFilter,
  equipmentFilter,
  setEquipmentFilter,
  departments = ["All Departments", "Chemistry", "Biology", "Physics", "Bioengineering", "Material Science"],
  equipmentList = ["All Equipment", "Spectrometer", "Centrifuge", "Electron Microscope", "PCR Thermal Cycler", "HPLC System"],
  onReset,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterAltIcon color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
            Dashboard Filters
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1, maxWidth: { md: 750 } }}>
          {/* Phase 8: Date Filter */}
          <FormControl size="small" fullWidth sx={{ minWidth: 150 }}>
            <InputLabel id="date-filter-label">Date Period</InputLabel>
            <Select
              labelId="date-filter-label"
              value={dateFilter || "this_month"}
              label="Date Period"
              onChange={(e) => setDateFilter && setDateFilter(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this_week">This Week</MenuItem>
              <MenuItem value="this_month">This Month</MenuItem>
              <MenuItem value="this_quarter">This Quarter</MenuItem>
              <MenuItem value="this_year">This Year</MenuItem>
            </Select>
          </FormControl>

          {/* Phase 8: Department Filter */}
          <FormControl size="small" fullWidth sx={{ minWidth: 170 }}>
            <InputLabel id="dept-filter-label">Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              value={departmentFilter || "All Departments"}
              label="Department"
              onChange={(e) => setDepartmentFilter && setDepartmentFilter(e.target.value)}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Phase 8: Equipment Filter */}
          <FormControl size="small" fullWidth sx={{ minWidth: 170 }}>
            <InputLabel id="equip-filter-label">Equipment</InputLabel>
            <Select
              labelId="equip-filter-label"
              value={equipmentFilter || "All Equipment"}
              label="Equipment"
              onChange={(e) => setEquipmentFilter && setEquipmentFilter(e.target.value)}
            >
              {equipmentList.map((eq) => (
                <MenuItem key={eq} value={eq}>
                  {eq}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {onReset && (
          <Button
            size="small"
            variant="text"
            color="secondary"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{ fontWeight: 600 }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Paper>
  );
}
