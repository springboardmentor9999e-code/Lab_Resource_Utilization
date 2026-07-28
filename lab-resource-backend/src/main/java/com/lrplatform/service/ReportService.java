package com.lrplatform.service;

import com.lrplatform.dto.request.ReportGenerationRequest;
import com.lrplatform.dto.response.ReportResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.MaintenanceWorkOrder;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.EquipmentRepository;
import com.lrplatform.repository.MaintenanceWorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceWorkOrderRepository maintenanceWorkOrderRepository;
    private final DepartmentRepository departmentRepository;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    private final Map<Long, ReportResponse> reportStore = new ConcurrentHashMap<>();
    private final AtomicLong reportIdGenerator = new AtomicLong(1);

    public ReportResponse generateReport(ReportGenerationRequest request, Long userId, String userName) {
        String reportType = request.getReportType();
        if (reportType == null || reportType.isEmpty()) {
            throw new BadRequestException("Report type is required");
        }

        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "EXCEL";
        if (!format.equals("EXCEL") && !format.equals("PDF") && !format.equals("CSV")) {
            throw new BadRequestException("Unsupported format: " + format + ". Supported formats: EXCEL, PDF, CSV");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        String extension = getExtensionForFormat(format);
        String fileName = reportType.toLowerCase().replace(" ", "_") + "_report_" + timestamp + extension;

        Long reportId = reportIdGenerator.getAndIncrement();

        String filePath;
        switch (format) {
            case "PDF" -> filePath = generatePdfFile(reportType, fileName, request);
            case "CSV" -> filePath = generateCsvFile(reportType, fileName, request);
            default -> filePath = generateExcelFile(reportType, fileName, request);
        }

        ReportResponse report = ReportResponse.builder()
                .id(reportId)
                .reportType(reportType)
                .fileName(fileName)
                .filePath(filePath)
                .format(format)
                .status("COMPLETED")
                .generatedAt(LocalDateTime.now())
                .generatedBy(userId)
                .generatedByName(userName)
                .build();

        reportStore.put(reportId, report);
        log.info("Report generated: {} (format: {}) by user: {}", fileName, format, userName);
        return report;
    }

    public List<ReportResponse> getAllReports() {
        return new ArrayList<>(reportStore.values());
    }

    public ReportResponse getReportById(Long id) {
        ReportResponse report = reportStore.get(id);
        if (report == null) {
            throw new BadRequestException("Report not found with id: " + id);
        }
        return report;
    }

    private String getExtensionForFormat(String format) {
        return switch (format) {
            case "PDF" -> ".pdf";
            case "CSV" -> ".csv";
            default -> ".xlsx";
        };
    }

    private String generatePdfFile(String reportType, String fileName, ReportGenerationRequest request) {
        File reportsDir = new File(uploadDir, "reports");
        if (!reportsDir.exists()) {
            reportsDir.mkdirs();
        }

        File file = new File(reportsDir, fileName);

        try (FileOutputStream fos = new FileOutputStream(file)) {
            // Create a simple PDF-like content using plain text formatting
            // For a production system, use iText or Apache PDFBox
            StringBuilder pdfContent = new StringBuilder();
            pdfContent.append("LAB RESOURCE UTILIZATION PLATFORM - REPORT\n");
            pdfContent.append("Report Type: ").append(reportType).append("\n");
            pdfContent.append("Generated: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
            pdfContent.append("=" .repeat(80)).append("\n\n");

            switch (reportType) {
                case "EQUIPMENT_UTILIZATION" -> writeEquipmentUtilizationPdf(pdfContent);
                case "DEPARTMENT_REPORT" -> writeDepartmentReportPdf(pdfContent);
                case "MAINTENANCE_REPORT" -> writeMaintenanceReportPdf(pdfContent);
                case "COST_ANALYSIS" -> writeCostAnalysisPdf(pdfContent);
                default -> pdfContent.append("Report data for: ").append(reportType).append("\n");
            }

            fos.write(pdfContent.toString().getBytes());
            log.info("PDF file created: {}", file.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to generate PDF report", e);
            throw new BadRequestException("Failed to generate PDF report: " + e.getMessage());
        }

        return file.getAbsolutePath();
    }

    private String generateCsvFile(String reportType, String fileName, ReportGenerationRequest request) {
        File reportsDir = new File(uploadDir, "reports");
        if (!reportsDir.exists()) {
            reportsDir.mkdirs();
        }

        File file = new File(reportsDir, fileName);

        try (PrintWriter writer = new PrintWriter(new FileWriter(file))) {
            switch (reportType) {
                case "EQUIPMENT_UTILIZATION" -> writeEquipmentUtilizationCsv(writer);
                case "DEPARTMENT_REPORT" -> writeDepartmentReportCsv(writer);
                case "MAINTENANCE_REPORT" -> writeMaintenanceReportCsv(writer);
                case "COST_ANALYSIS" -> writeCostAnalysisCsv(writer);
                default -> writer.println("Report Type: " + reportType);
            }
            log.info("CSV file created: {}", file.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to generate CSV report", e);
            throw new BadRequestException("Failed to generate CSV report: " + e.getMessage());
        }

        return file.getAbsolutePath();
    }

    private void writeEquipmentUtilizationPdf(StringBuilder sb) {
        sb.append("Equipment Code,Equipment Name,Manufacturer,Status,Laboratory,Category\n");
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            sb.append(eq.getEquipmentCode()).append(",")
              .append(eq.getEquipmentName()).append(",")
              .append(eq.getManufacturer() != null ? eq.getManufacturer() : "").append(",")
              .append(eq.getStatus().name()).append(",")
              .append(eq.getLaboratory() != null ? eq.getLaboratory().getLaboratoryName() : "").append(",")
              .append(eq.getCategory() != null ? eq.getCategory().getCategoryName() : "").append("\n");
        }
    }

    private void writeDepartmentReportPdf(StringBuilder sb) {
        sb.append("Department,Institution,Equipment Count,Booking Count\n");
        var departments = departmentRepository.findAll();
        for (var dept : departments) {
            long eqCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bkCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            sb.append(dept.getDepartmentName()).append(",")
              .append(dept.getInstitution() != null ? dept.getInstitution().getInstitutionName() : "").append(",")
              .append(eqCount).append(",")
              .append(bkCount).append("\n");
        }
    }

    private void writeMaintenanceReportPdf(StringBuilder sb) {
        sb.append("Work Order ID,Equipment Code,Equipment Name,Status,Created At\n");
        List<MaintenanceWorkOrder> workOrders = maintenanceWorkOrderRepository.findAll();
        for (MaintenanceWorkOrder wo : workOrders) {
            sb.append(wo.getId()).append(",");
            if (wo.getEquipment() != null) {
                sb.append(wo.getEquipment().getEquipmentCode()).append(",")
                  .append(wo.getEquipment().getEquipmentName()).append(",");
            } else {
                sb.append(",,");
            }
            sb.append(wo.getStatus() != null ? wo.getStatus().name() : "").append(",")
              .append(wo.getCreatedAt() != null ? wo.getCreatedAt().toString() : "").append("\n");
        }
    }

    private void writeCostAnalysisPdf(StringBuilder sb) {
        sb.append("Equipment Code,Equipment Name,Purchase Cost,Status\n");
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            sb.append(eq.getEquipmentCode()).append(",")
              .append(eq.getEquipmentName()).append(",")
              .append(eq.getPurchaseCost() != null ? eq.getPurchaseCost().doubleValue() : 0).append(",")
              .append(eq.getStatus().name()).append("\n");
        }
    }

    private void writeEquipmentUtilizationCsv(PrintWriter writer) {
        writer.println("Equipment Code,Equipment Name,Manufacturer,Status,Laboratory,Category");
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            writer.println(String.format("%s,%s,%s,%s,%s,%s",
                eq.getEquipmentCode(),
                eq.getEquipmentName(),
                eq.getManufacturer() != null ? eq.getManufacturer() : "",
                eq.getStatus().name(),
                eq.getLaboratory() != null ? eq.getLaboratory().getLaboratoryName() : "",
                eq.getCategory() != null ? eq.getCategory().getCategoryName() : ""));
        }
    }

    private void writeDepartmentReportCsv(PrintWriter writer) {
        writer.println("Department,Institution,Equipment Count,Booking Count");
        var departments = departmentRepository.findAll();
        for (var dept : departments) {
            long eqCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bkCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            writer.println(String.format("%s,%s,%d,%d",
                dept.getDepartmentName(),
                dept.getInstitution() != null ? dept.getInstitution().getInstitutionName() : "",
                eqCount,
                bkCount));
        }
    }

    private void writeMaintenanceReportCsv(PrintWriter writer) {
        writer.println("Work Order ID,Equipment Code,Equipment Name,Status,Created At");
        List<MaintenanceWorkOrder> workOrders = maintenanceWorkOrderRepository.findAll();
        for (MaintenanceWorkOrder wo : workOrders) {
            String eqCode = wo.getEquipment() != null ? wo.getEquipment().getEquipmentCode() : "";
            String eqName = wo.getEquipment() != null ? wo.getEquipment().getEquipmentName() : "";
            writer.println(String.format("%d,%s,%s,%s,%s",
                wo.getId(),
                eqCode,
                eqName,
                wo.getStatus() != null ? wo.getStatus().name() : "",
                wo.getCreatedAt() != null ? wo.getCreatedAt().toString() : ""));
        }
    }

    private void writeCostAnalysisCsv(PrintWriter writer) {
        writer.println("Equipment Code,Equipment Name,Purchase Cost,Status");
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            writer.println(String.format("%s,%s,%.2f,%s",
                eq.getEquipmentCode(),
                eq.getEquipmentName(),
                eq.getPurchaseCost() != null ? eq.getPurchaseCost().doubleValue() : 0,
                eq.getStatus().name()));
        }
    }

    private String generateExcelFile(String reportType, String fileName, ReportGenerationRequest request) {
        File reportsDir = new File(uploadDir, "reports");
        if (!reportsDir.exists()) {
            reportsDir.mkdirs();
        }

        File file = new File(reportsDir, fileName);

        try (Workbook workbook = new XSSFWorkbook(); FileOutputStream fos = new FileOutputStream(file)) {
            Sheet sheet = workbook.createSheet(reportType);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int rowNum = 0;

            switch (reportType) {
                case "EQUIPMENT_UTILIZATION" -> rowNum = writeEquipmentUtilization(sheet, headerStyle);
                case "DEPARTMENT_REPORT" -> rowNum = writeDepartmentReport(sheet, headerStyle);
                case "MAINTENANCE_REPORT" -> rowNum = writeMaintenanceReport(sheet, headerStyle);
                case "COST_ANALYSIS" -> rowNum = writeCostAnalysis(sheet, headerStyle);
                default -> {
                    Row headerRow = sheet.createRow(rowNum++);
                    headerRow.createCell(0).setCellValue("Report Type: " + reportType);
                }
            }

            workbook.write(fos);
            log.info("Excel file created: {}", file.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to generate Excel report", e);
            throw new BadRequestException("Failed to generate report file: " + e.getMessage());
        }

        return file.getAbsolutePath();
    }

    private int writeEquipmentUtilization(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Equipment Code", "Equipment Name", "Manufacturer", "Status", "Laboratory", "Category"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<Equipment> equipmentList = equipmentRepository.findAll();
        int rowNum = 1;
        for (Equipment eq : equipmentList) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(eq.getEquipmentCode());
            row.createCell(1).setCellValue(eq.getEquipmentName());
            row.createCell(2).setCellValue(eq.getManufacturer() != null ? eq.getManufacturer() : "");
            row.createCell(3).setCellValue(eq.getStatus().name());
            row.createCell(4).setCellValue(eq.getLaboratory() != null ? eq.getLaboratory().getLaboratoryName() : "");
            row.createCell(5).setCellValue(eq.getCategory() != null ? eq.getCategory().getCategoryName() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }

    private int writeDepartmentReport(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Department", "Institution", "Equipment Count", "Booking Count"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var departments = departmentRepository.findAll();
        int rowNum = 1;
        for (var dept : departments) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(dept.getDepartmentName());
            row.createCell(1).setCellValue(dept.getInstitution() != null ? dept.getInstitution().getInstitutionName() : "");
            long eqCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bkCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            row.createCell(2).setCellValue(eqCount);
            row.createCell(3).setCellValue(bkCount);
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }

    private int writeMaintenanceReport(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Work Order ID", "Equipment Code", "Equipment Name", "Status", "Created At"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<MaintenanceWorkOrder> workOrders = maintenanceWorkOrderRepository.findAll();
        int rowNum = 1;
        for (MaintenanceWorkOrder wo : workOrders) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(wo.getId());
            if (wo.getEquipment() != null) {
                row.createCell(1).setCellValue(wo.getEquipment().getEquipmentCode());
                row.createCell(2).setCellValue(wo.getEquipment().getEquipmentName());
            }
            row.createCell(3).setCellValue(wo.getStatus() != null ? wo.getStatus().name() : "");
            row.createCell(4).setCellValue(wo.getCreatedAt() != null ? wo.getCreatedAt().toString() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }

    private int writeCostAnalysis(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Equipment Code", "Equipment Name", "Purchase Cost", "Status"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<Equipment> equipmentList = equipmentRepository.findAll();
        int rowNum = 1;
        for (Equipment eq : equipmentList) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(eq.getEquipmentCode());
            row.createCell(1).setCellValue(eq.getEquipmentName());
            row.createCell(2).setCellValue(eq.getPurchaseCost() != null ? eq.getPurchaseCost().doubleValue() : 0);
            row.createCell(3).setCellValue(eq.getStatus().name());
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }
}
