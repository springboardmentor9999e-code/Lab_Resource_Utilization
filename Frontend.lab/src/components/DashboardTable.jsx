import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  TablePagination,
  Button,
} from "@mui/material";

export default function DashboardTable({
  title,
  columns = [],
  data = [],
  actionLabel,
  onActionClick,
  emptyMessage = "No records found",
  rowsPerPageDefault = 5,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const renderCellValue = (column, row) => {
    const val = row[column.key];

    if (column.render) {
      return column.render(val, row);
    }

    if (column.type === "chip") {
      const colorMap = {
        CONFIRMED: "success",
        APPROVED: "success",
        ACTIVE: "success",
        AVAILABLE: "success",
        PENDING: "warning",
        IN_PROGRESS: "info",
        MAINTENANCE: "warning",
        COMPLETED: "default",
        CANCELLED: "error",
        REJECTED: "error",
        NO_SHOW: "error",
      };
      const chipColor = colorMap[String(val).toUpperCase()] || "primary";
      return <Chip label={String(val)} color={chipColor} size="small" sx={{ fontWeight: 700, fontSize: "0.75rem" }} />;
    }

    return val !== null && val !== undefined ? String(val) : "-";
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <Box
          p={2.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
            {title}
          </Typography>
          {actionLabel && (
            <Button size="small" variant="outlined" onClick={onActionClick} sx={{ borderRadius: 2 }}>
              {actionLabel}
            </Button>
          )}
        </Box>
      )}

      <TableContainer sx={{ flex: 1 }}>
        <Table sx={{ minWidth: 500 }} aria-label={title || "dashboard table"}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || "left"} sx={{ py: 1.8 }}>
                      {renderCellValue(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data.length > rowsPerPageDefault && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: "1px solid", borderColor: "divider" }}
        />
      )}
    </Paper>
  );
}
