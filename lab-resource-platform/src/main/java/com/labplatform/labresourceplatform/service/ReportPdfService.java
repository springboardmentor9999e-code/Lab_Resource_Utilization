package com.labplatform.labresourceplatform.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.labplatform.labresourceplatform.entity.BillingRecord;
import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import com.labplatform.labresourceplatform.entity.Maintenance;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.Map;

// Renders a ReportService.ReportData into a downloadable PDF. Kept separate
// from ReportService itself so the actual report CONTENT (what data goes in
// the report) stays independent of PDF LAYOUT (fonts, tables, page breaks) -
// a future second export format (e.g. Excel/CSV) could reuse ReportService's
// output without touching this class at all.
@Service
public class ReportPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 20, Font.BOLD);
    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(0x2b, 0x2b, 0x2b));
    private static final Font SUBTITLE_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, Color.GRAY);
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE);
    private static final Font TABLE_CELL_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL);
    private static final Font EMPTY_SECTION_FONT = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY);
    private static final Color HEADER_BG = new Color(0x1f, 0x29, 0x37);

    public byte[] renderPdf(ReportService.ReportData data, String institutionLabel) {
        Document document = new Document(PageSize.A4, 40, 40, 50, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            addTitle(document, institutionLabel, data);
            addSummary(document, data);
            addUtilizationSection(document, data);
            addIdleEquipmentSection(document, data);
            addMaintenanceSection(document, data);
            addCalibrationSection(document, data);
            addBillingSection(document, data);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate report PDF: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addTitle(Document document, String institutionLabel, ReportService.ReportData data) throws DocumentException {
        Paragraph title = new Paragraph("Lab Resource Utilization Report", TITLE_FONT);
        title.setSpacingAfter(4);
        document.add(title);

        String range = data.from().format(DATE_FMT) + " \u2013 " + data.to().format(DATE_FMT);
        Paragraph subtitle = new Paragraph(institutionLabel + "  \u00b7  " + range, SUBTITLE_FONT);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);
    }

    private void addSummary(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Summary");

        PdfPTable table = newTable(2);
        addSummaryRow(table, "Equipment tracked", String.valueOf(data.equipmentCount()));
        addSummaryRow(table, "Idle equipment (1+ week unused)", String.valueOf(data.idleEquipment().size()));
        addSummaryRow(table, "Maintenance records", String.valueOf(data.maintenanceRecords().size()));
        addSummaryRow(table, "Calibrations due within 30 days", String.valueOf(data.calibrationReminders().size()));
        addSummaryRow(table, "Owed to your institution", "$" + data.totalOwed().setScale(2, RoundingMode.HALF_UP));
        addSummaryRow(table, "Your institution owes", "$" + data.totalOwing().setScale(2, RoundingMode.HALF_UP));
        document.add(table);
        addSpacer(document);
    }

    private void addSummaryRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, TABLE_CELL_FONT));
        labelCell.setBorder(Rectangle.BOTTOM);
        labelCell.setBorderColor(new Color(0xe5, 0xe5, 0xe5));
        labelCell.setPadding(6);
        table.addCell(labelCell);

        Font boldValue = new Font(Font.HELVETICA, 9, Font.BOLD);
        PdfPCell valueCell = new PdfPCell(new Phrase(value, boldValue));
        valueCell.setBorder(Rectangle.BOTTOM);
        valueCell.setBorderColor(new Color(0xe5, 0xe5, 0xe5));
        valueCell.setPadding(6);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private void addUtilizationSection(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Utilization Effectiveness");

        if (data.heatmap().isEmpty()) {
            addEmptyNote(document, "No usage data recorded in this window.");
            return;
        }

        PdfPTable table = newTable(3);
        addTableHeader(table, "Equipment", "Category", "Utilization");
        for (Map<String, Object> row : data.heatmap()) {
            addTableRow(table,
                    String.valueOf(row.get("equipmentName")),
                    String.valueOf(row.get("category")),
                    row.get("utilizationRatePercent") + "%");
        }
        document.add(table);
        addSpacer(document);
    }

    private void addIdleEquipmentSection(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Idle Equipment (Sharing/Reallocation Candidates)");

        if (data.idleEquipment().isEmpty()) {
            addEmptyNote(document, "No equipment has been idle for a week or more.");
            return;
        }

        PdfPTable table = newTable(3);
        addTableHeader(table, "Equipment", "Status", "Idle for");
        for (Map<String, Object> row : data.idleEquipment()) {
            Object idleHours = row.get("idleHours");
            String idleText = idleHours == null ? "Never used" : (((Long) idleHours) / 24) + " days";
            addTableRow(table, String.valueOf(row.get("equipmentName")), String.valueOf(row.get("status")), idleText);
        }
        document.add(table);
        addSpacer(document);
    }

    private void addMaintenanceSection(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Maintenance History");

        if (data.maintenanceRecords().isEmpty()) {
            addEmptyNote(document, "No maintenance records on file.");
            return;
        }

        PdfPTable table = newTable(4);
        addTableHeader(table, "Equipment", "Type", "Status", "Date");
        for (Maintenance m : data.maintenanceRecords()) {
            addTableRow(table,
                    m.getEquipment() != null ? m.getEquipment().getEquipmentName() : "\u2014",
                    m.getWorkOrderType() != null ? m.getWorkOrderType() : "\u2014",
                    m.getStatus() != null ? m.getStatus() : "\u2014",
                    m.getStartDate() != null ? m.getStartDate().toString() : "\u2014");
        }
        document.add(table);
        addSpacer(document);
    }

    private void addCalibrationSection(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Calibration Renewals Due");

        if (data.calibrationReminders().isEmpty()) {
            addEmptyNote(document, "No calibrations due or overdue in the next 30 days.");
            return;
        }

        PdfPTable table = newTable(3);
        addTableHeader(table, "Equipment", "Standard", "Expires");
        for (CalibrationRecord c : data.calibrationReminders()) {
            addTableRow(table,
                    c.getEquipment() != null ? c.getEquipment().getEquipmentName() : "\u2014",
                    c.getCertificationStandard() != null ? c.getCertificationStandard() : "\u2014",
                    c.getExpiryDate() != null ? c.getExpiryDate().toString() : "\u2014");
        }
        document.add(table);
        addSpacer(document);
    }

    private void addBillingSection(Document document, ReportService.ReportData data) throws DocumentException {
        addSectionHeader(document, "Cost Analysis \u2014 Inter-Institution Billing");

        if (data.billingRecords().isEmpty()) {
            addEmptyNote(document, "No billing activity in this period.");
            return;
        }

        PdfPTable table = newTable(4);
        addTableHeader(table, "Equipment", "Billed to", "Total", "Status");
        for (BillingRecord r : data.billingRecords()) {
            addTableRow(table,
                    r.getEquipment() != null ? r.getEquipment().getEquipmentName() : "\u2014",
                    r.getBilledInstitution() != null ? r.getBilledInstitution().getInstitutionName() : "\u2014",
                    "$" + r.getTotalCost().setScale(2, RoundingMode.HALF_UP),
                    r.getStatus());
        }
        document.add(table);
    }

    // --- layout helpers ---

    private void addSectionHeader(Document document, String text) throws DocumentException {
        Paragraph header = new Paragraph(text, SECTION_FONT);
        header.setSpacingBefore(4);
        header.setSpacingAfter(8);
        document.add(header);
    }

    private void addEmptyNote(Document document, String text) throws DocumentException {
        Paragraph note = new Paragraph(text, EMPTY_SECTION_FONT);
        note.setSpacingAfter(16);
        document.add(note);
    }

    private void addSpacer(Document document) throws DocumentException {
        document.add(new Paragraph(" ", TABLE_CELL_FONT));
    }

    private PdfPTable newTable(int columns) {
        PdfPTable table = new PdfPTable(columns);
        table.setWidthPercentage(100);
        table.setSpacingAfter(16);
        return table;
    }

    private void addTableHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, TABLE_HEADER_FONT));
            cell.setBackgroundColor(HEADER_BG);
            cell.setPadding(6);
            cell.setBorderColor(HEADER_BG);
            table.addCell(cell);
        }
    }

    private void addTableRow(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, TABLE_CELL_FONT));
            cell.setPadding(6);
            cell.setBorderColor(new Color(0xe5, 0xe5, 0xe5));
            table.addCell(cell);
        }
    }
}
