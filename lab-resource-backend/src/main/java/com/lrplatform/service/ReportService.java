package com.lrplatform.service;

import com.lrplatform.dto.request.ReportGenerationRequest;
import com.lrplatform.dto.response.ReportResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.entity.DepartmentBudget;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.MaintenanceWorkOrder;
import com.lrplatform.model.entity.Payment;
import com.lrplatform.model.entity.ReportHistory;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.DepartmentBudgetRepository;
import com.lrplatform.repository.DepartmentRepository;
import com.lrplatform.repository.EquipmentRepository;
import com.lrplatform.repository.MaintenanceWorkOrderRepository;
import com.lrplatform.repository.PaymentRepository;
import com.lrplatform.repository.ReportHistoryRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.element.LineSeparator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceWorkOrderRepository maintenanceWorkOrderRepository;
    private final DepartmentRepository departmentRepository;
    private final ReportHistoryRepository reportHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final DepartmentBudgetRepository departmentBudgetRepository;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

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

        String filePath;
        switch (format) {
            case "PDF" -> filePath = generatePdfFile(reportType, fileName, request);
            case "CSV" -> filePath = generateCsvFile(reportType, fileName, request);
            default -> filePath = generateExcelFile(reportType, fileName, request);
        }

        ReportHistory history = ReportHistory.builder()
                .reportType(reportType)
                .fileName(fileName)
                .filePath(filePath)
                .format(format)
                .status("COMPLETED")
                .generatedAt(LocalDateTime.now())
                .generatedBy(userId)
                .generatedByName(userName)
                .build();
        ReportHistory saved = reportHistoryRepository.save(history);

        ReportResponse report = ReportResponse.builder()
                .id(saved.getId())
                .reportType(reportType)
                .fileName(fileName)
                .filePath(filePath)
                .format(format)
                .status("COMPLETED")
                .generatedAt(saved.getGeneratedAt())
                .generatedBy(userId)
                .generatedByName(userName)
                .build();

        log.info("Report generated: {} (format: {}) by user: {}", fileName, format, userName);
        return report;
    }

    public List<ReportResponse> getAllReports() {
        return reportHistoryRepository.findAllByOrderByGeneratedAtDesc().stream()
                .map(h -> ReportResponse.builder()
                        .id(h.getId())
                        .reportType(h.getReportType())
                        .fileName(h.getFileName())
                        .filePath(h.getFilePath())
                        .format(h.getFormat())
                        .status(h.getStatus())
                        .generatedAt(h.getGeneratedAt())
                        .generatedBy(h.getGeneratedBy())
                        .generatedByName(h.getGeneratedByName())
                        .build())
                .toList();
    }

    public ReportResponse getReportById(Long id) {
        ReportHistory h = reportHistoryRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Report not found with id: " + id));
        return ReportResponse.builder()
                .id(h.getId())
                .reportType(h.getReportType())
                .fileName(h.getFileName())
                .filePath(h.getFilePath())
                .format(h.getFormat())
                .status(h.getStatus())
                .generatedAt(h.getGeneratedAt())
                .generatedBy(h.getGeneratedBy())
                .generatedByName(h.getGeneratedByName())
                .build();
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

        try (PdfWriter writer = new PdfWriter(file);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc)) {

            PdfFont boldFont = PdfFontFactory.createFont();
            PdfFont regularFont = PdfFontFactory.createFont();

            document.add(new Paragraph("LAB RESOURCE UTILIZATION PLATFORM")
                    .setFont(boldFont).setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph(reportType.replace("_", " ") + " Report")
                    .setFont(regularFont).setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                    .setFont(regularFont).setFontSize(10));
            document.add(new LineSeparator(new SolidLine()));
            document.add(new Paragraph(" "));

            switch (reportType) {
                case "EQUIPMENT_UTILIZATION" -> writeEquipmentUtilizationPdfDoc(document);
                case "DEPARTMENT_REPORT" -> writeDepartmentReportPdfDoc(document);
                case "MAINTENANCE_REPORT" -> writeMaintenanceReportPdfDoc(document);
                case "COST_ANALYSIS" -> writeCostAnalysisPdfDoc(document);
                case "BOOKING_HISTORY" -> writeBookingHistoryPdfDoc(document);
                case "PAYMENT_SUMMARY" -> writePaymentSummaryPdfDoc(document);
                case "BUDGET_SUMMARY" -> writeBudgetSummaryPdfDoc(document);
                default -> document.add(new Paragraph("Report data for: " + reportType));
            }

            log.info("PDF file created: {}", file.getAbsolutePath());
        } catch (Exception e) {
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
                case "BOOKING_HISTORY" -> writeBookingHistoryCsv(writer);
                case "PAYMENT_SUMMARY" -> writePaymentSummaryCsv(writer);
                case "BUDGET_SUMMARY" -> writeBudgetSummaryCsv(writer);
                default -> writer.println("Report Type: " + reportType);
            }
            log.info("CSV file created: {}", file.getAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to generate CSV report", e);
            throw new BadRequestException("Failed to generate CSV report: " + e.getMessage());
        }

        return file.getAbsolutePath();
    }

    private void writeEquipmentUtilizationPdfDoc(Document document) {
        String[] headers = {"Code", "Name", "Manufacturer", "Status", "Laboratory", "Category"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            table.addCell(eq.getEquipmentCode());
            table.addCell(eq.getEquipmentName());
            table.addCell(eq.getManufacturer() != null ? eq.getManufacturer() : "");
            table.addCell(eq.getStatus().name());
            table.addCell(eq.getLaboratory() != null ? eq.getLaboratory().getLaboratoryName() : "");
            table.addCell(eq.getCategory() != null ? eq.getCategory().getCategoryName() : "");
        }
        document.add(table);
    }

    private void writeDepartmentReportPdfDoc(Document document) {
        String[] headers = {"Department", "Institution", "Equipment Count", "Booking Count"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        var departments = departmentRepository.findAll();
        for (var dept : departments) {
            long eqCount = equipmentRepository.countByLaboratoryDepartmentId(dept.getId());
            long bkCount = bookingRepository.countByEquipmentLaboratoryDepartmentId(dept.getId());
            table.addCell(dept.getDepartmentName());
            table.addCell(dept.getInstitution() != null ? dept.getInstitution().getInstitutionName() : "");
            table.addCell(String.valueOf(eqCount));
            table.addCell(String.valueOf(bkCount));
        }
        document.add(table);
    }

    private void writeMaintenanceReportPdfDoc(Document document) {
        String[] headers = {"Work Order ID", "Equipment Code", "Equipment Name", "Status", "Created At"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<MaintenanceWorkOrder> workOrders = maintenanceWorkOrderRepository.findAll();
        for (MaintenanceWorkOrder wo : workOrders) {
            table.addCell(String.valueOf(wo.getId()));
            table.addCell(wo.getEquipment() != null ? wo.getEquipment().getEquipmentCode() : "");
            table.addCell(wo.getEquipment() != null ? wo.getEquipment().getEquipmentName() : "");
            table.addCell(wo.getStatus() != null ? wo.getStatus().name() : "");
            table.addCell(wo.getCreatedAt() != null ? wo.getCreatedAt().toString() : "");
        }
        document.add(table);
    }

    private void writeCostAnalysisPdfDoc(Document document) {
        String[] headers = {"Equipment Code", "Equipment Name", "Purchase Cost", "Status"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<Equipment> equipmentList = equipmentRepository.findAll();
        for (Equipment eq : equipmentList) {
            table.addCell(eq.getEquipmentCode());
            table.addCell(eq.getEquipmentName());
            table.addCell(eq.getPurchaseCost() != null ? "₹" + eq.getPurchaseCost().doubleValue() : "₹0");
            table.addCell(eq.getStatus().name());
        }
        document.add(table);
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
                case "BOOKING_HISTORY" -> rowNum = writeBookingHistory(sheet, headerStyle);
                case "PAYMENT_SUMMARY" -> rowNum = writePaymentSummary(sheet, headerStyle);
                case "BUDGET_SUMMARY" -> rowNum = writeBudgetSummary(sheet, headerStyle);
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

    // ===================== BOOKING HISTORY =====================

    private void writeBookingHistoryPdfDoc(Document document) {
        String[] headers = {"ID", "Equipment", "User", "Date", "Time", "Status", "Purpose"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<Booking> bookings = bookingRepository.findAll();
        for (Booking b : bookings) {
            table.addCell(String.valueOf(b.getId()));
            table.addCell(b.getEquipment() != null ? b.getEquipment().getEquipmentName() : "");
            table.addCell(b.getUser() != null ? b.getUser().getFirstName() + " " + b.getUser().getLastName() : "");
            table.addCell(b.getBookingDate() != null ? b.getBookingDate().toString() : "");
            table.addCell((b.getStartTime() != null ? b.getStartTime() : "") + " - " + (b.getEndTime() != null ? b.getEndTime() : ""));
            table.addCell(b.getStatus() != null ? b.getStatus().name() : "");
            table.addCell(b.getPurpose() != null ? b.getPurpose() : "");
        }
        document.add(table);
    }

    private void writeBookingHistoryCsv(PrintWriter writer) {
        writer.println("ID,Equipment,User,Date,Start Time,End Time,Status,Purpose");
        List<Booking> bookings = bookingRepository.findAll();
        for (Booking b : bookings) {
            String eqName = b.getEquipment() != null ? b.getEquipment().getEquipmentName() : "";
            String userName = b.getUser() != null ? b.getUser().getFirstName() + " " + b.getUser().getLastName() : "";
            writer.println(String.format("%d,%s,%s,%s,%s,%s,%s,\"%s\"",
                b.getId(), eqName, userName,
                b.getBookingDate() != null ? b.getBookingDate() : "",
                b.getStartTime() != null ? b.getStartTime() : "",
                b.getEndTime() != null ? b.getEndTime() : "",
                b.getStatus() != null ? b.getStatus().name() : "",
                b.getPurpose() != null ? b.getPurpose() : ""));
        }
    }

    private int writeBookingHistory(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"ID", "Equipment", "User", "Date", "Start Time", "End Time", "Status", "Purpose"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        List<Booking> bookings = bookingRepository.findAll();
        int rowNum = 1;
        for (Booking b : bookings) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(b.getId());
            row.createCell(1).setCellValue(b.getEquipment() != null ? b.getEquipment().getEquipmentName() : "");
            row.createCell(2).setCellValue(b.getUser() != null ? b.getUser().getFirstName() + " " + b.getUser().getLastName() : "");
            row.createCell(3).setCellValue(b.getBookingDate() != null ? b.getBookingDate().toString() : "");
            row.createCell(4).setCellValue(b.getStartTime() != null ? b.getStartTime().toString() : "");
            row.createCell(5).setCellValue(b.getEndTime() != null ? b.getEndTime().toString() : "");
            row.createCell(6).setCellValue(b.getStatus() != null ? b.getStatus().name() : "");
            row.createCell(7).setCellValue(b.getPurpose() != null ? b.getPurpose() : "");
        }
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }

    // ===================== PAYMENT SUMMARY =====================

    private void writePaymentSummaryPdfDoc(Document document) {
        String[] headers = {"ID", "Invoice #", "Amount Paid", "Method", "Reference", "Date", "Status"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<Payment> payments = paymentRepository.findAll();
        for (Payment p : payments) {
            table.addCell(String.valueOf(p.getId()));
            table.addCell(p.getInvoice() != null ? String.valueOf(p.getInvoice().getId()) : "");
            table.addCell(p.getAmountPaid() != null ? "₹" + p.getAmountPaid().doubleValue() : "₹0");
            table.addCell(p.getPaymentMethod() != null ? p.getPaymentMethod() : "");
            table.addCell(p.getPaymentReference() != null ? p.getPaymentReference() : "");
            table.addCell(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate().toString() : "");
            table.addCell(p.getPaymentStatus() != null ? p.getPaymentStatus().name() : "");
        }
        document.add(table);
    }

    private void writePaymentSummaryCsv(PrintWriter writer) {
        writer.println("ID,Invoice ID,Amount Paid,Method,Reference,Date,Status");
        List<Payment> payments = paymentRepository.findAll();
        for (Payment p : payments) {
            writer.println(String.format("%d,%d,%.2f,%s,%s,%s,%s",
                p.getId(),
                p.getInvoice() != null ? p.getInvoice().getId() : 0,
                p.getAmountPaid() != null ? p.getAmountPaid().doubleValue() : 0,
                p.getPaymentMethod() != null ? p.getPaymentMethod() : "",
                p.getPaymentReference() != null ? p.getPaymentReference() : "",
                p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate() : "",
                p.getPaymentStatus() != null ? p.getPaymentStatus().name() : ""));
        }
    }

    private int writePaymentSummary(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"ID", "Invoice ID", "Amount Paid", "Method", "Reference", "Date", "Status"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        List<Payment> payments = paymentRepository.findAll();
        int rowNum = 1;
        for (Payment p : payments) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(p.getId());
            row.createCell(1).setCellValue(p.getInvoice() != null ? p.getInvoice().getId() : 0);
            row.createCell(2).setCellValue(p.getAmountPaid() != null ? p.getAmountPaid().doubleValue() : 0);
            row.createCell(3).setCellValue(p.getPaymentMethod() != null ? p.getPaymentMethod() : "");
            row.createCell(4).setCellValue(p.getPaymentReference() != null ? p.getPaymentReference() : "");
            row.createCell(5).setCellValue(p.getPaymentDate() != null ? p.getPaymentDate().toLocalDate().toString() : "");
            row.createCell(6).setCellValue(p.getPaymentStatus() != null ? p.getPaymentStatus().name() : "");
        }
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }

    // ===================== BUDGET SUMMARY =====================

    private void writeBudgetSummaryPdfDoc(Document document) {
        String[] headers = {"Department", "Fiscal Year", "Budget Amount", "Description"};
        Table table = new Table(UnitValue.createPercentArray(headers.length)).useAllAvailableWidth();
        for (String h : headers) {
            table.addHeaderCell(new com.itextpdf.layout.element.Cell().add(new Paragraph(h)).setBold());
        }
        List<DepartmentBudget> budgets = departmentBudgetRepository.findAll();
        for (DepartmentBudget db : budgets) {
            table.addCell(db.getDepartment() != null ? db.getDepartment().getDepartmentName() : "");
            table.addCell(String.valueOf(db.getFiscalYear()));
            table.addCell(db.getBudgetAmount() != null ? "₹" + db.getBudgetAmount().doubleValue() : "₹0");
            table.addCell(db.getDescription() != null ? db.getDescription() : "");
        }
        document.add(table);
    }

    private void writeBudgetSummaryCsv(PrintWriter writer) {
        writer.println("Department,Fiscal Year,Budget Amount,Description");
        List<DepartmentBudget> budgets = departmentBudgetRepository.findAll();
        for (DepartmentBudget db : budgets) {
            writer.println(String.format("%s,%d,%.2f,\"%s\"",
                db.getDepartment() != null ? db.getDepartment().getDepartmentName() : "",
                db.getFiscalYear(),
                db.getBudgetAmount() != null ? db.getBudgetAmount().doubleValue() : 0,
                db.getDescription() != null ? db.getDescription() : ""));
        }
    }

    private int writeBudgetSummary(Sheet sheet, CellStyle headerStyle) {
        String[] headers = {"Department", "Fiscal Year", "Budget Amount", "Description"};
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        List<DepartmentBudget> budgets = departmentBudgetRepository.findAll();
        int rowNum = 1;
        for (DepartmentBudget db : budgets) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(db.getDepartment() != null ? db.getDepartment().getDepartmentName() : "");
            row.createCell(1).setCellValue(db.getFiscalYear());
            row.createCell(2).setCellValue(db.getBudgetAmount() != null ? db.getBudgetAmount().doubleValue() : 0);
            row.createCell(3).setCellValue(db.getDescription() != null ? db.getDescription() : "");
        }
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
        return rowNum;
    }
}
