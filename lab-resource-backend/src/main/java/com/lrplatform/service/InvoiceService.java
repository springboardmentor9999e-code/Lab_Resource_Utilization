package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.InvoiceRequest;
import com.lrplatform.dto.response.InvoiceResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Booking;
import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.entity.Institution;
import com.lrplatform.model.entity.Invoice;
import com.lrplatform.model.entity.Payment;
import com.lrplatform.model.enums.BookingStatus;
import com.lrplatform.model.enums.PaymentStatus;
import com.lrplatform.repository.BookingRepository;
import com.lrplatform.repository.InstitutionRepository;
import com.lrplatform.repository.InvoiceRepository;
import com.lrplatform.repository.PaymentRepository;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.LineSeparator;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InstitutionRepository institutionRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Value("${storage.local.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional(readOnly = true)
    public PaginatedResponse<InvoiceResponse> getAllInvoices(int page, int size, String status, Long institutionId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Invoice> invoicePage;

        if (institutionId != null && status != null) {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status);
            invoicePage = invoiceRepository.findByInstitutionIdAndPaymentStatusOrderByGeneratedAtDesc(institutionId, paymentStatus, pageable);
        } else if (institutionId != null) {
            invoicePage = invoiceRepository.findByInstitutionIdOrderByGeneratedAtDesc(institutionId, pageable);
        } else if (status != null) {
            PaymentStatus paymentStatus = PaymentStatus.valueOf(status);
            invoicePage = invoiceRepository.findByPaymentStatusOrderByDueDateAsc(paymentStatus, pageable);
        } else {
            invoicePage = invoiceRepository.findAll(pageable);
        }

        return toPaginatedResponse(invoicePage);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return toResponse(invoice);
    }

    @Auditable(module = "INVOICE", action = "CREATE", entityType = "Invoice")
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Institution institution = institutionRepository.findById(request.getInstitutionId())
                .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));

        String invoiceNumber = generateInvoiceNumber();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .institution(institution)
                .totalAmount(request.getTotalAmount())
                .taxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .dueDate(request.getDueDate())
                .build();

        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            invoice.setBooking(booking);
        }

        invoiceRepository.save(invoice);
        log.info("Invoice created: {} for institution: {}", invoiceNumber, institution.getInstitutionName());
        return toResponse(invoice);
    }

    @Auditable(module = "INVOICE", action = "UPDATE", entityType = "Invoice")
    @Transactional
    public InvoiceResponse updateInvoice(Long id, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if (request.getTotalAmount() != null) invoice.setTotalAmount(request.getTotalAmount());
        if (request.getTaxAmount() != null) invoice.setTaxAmount(request.getTaxAmount());
        if (request.getDueDate() != null) invoice.setDueDate(request.getDueDate());

        if (request.getInstitutionId() != null) {
            Institution institution = institutionRepository.findById(request.getInstitutionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Institution not found"));
            invoice.setInstitution(institution);
        }

        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            invoice.setBooking(booking);
        }

        invoiceRepository.save(invoice);
        log.info("Invoice updated: {}", invoice.getInvoiceNumber());
        return toResponse(invoice);
    }

    @Auditable(module = "INVOICE", action = "DELETE", entityType = "Invoice")
    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        invoiceRepository.delete(invoice);
        log.info("Invoice deleted: {}", invoice.getInvoiceNumber());
    }

    @Auditable(module = "INVOICE", action = "CREATE", entityType = "Invoice")
    @Transactional
    public InvoiceResponse generateInvoiceFromBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("Can only generate invoice for completed bookings");
        }

        Equipment equipment = booking.getEquipment();
        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal hoursBilled = BigDecimal.ZERO;

        BigDecimal rate = equipment.getHourlyRate() != null ? equipment.getHourlyRate() : equipment.getPurchaseCost();
        if (rate != null) {
            hoursBilled = calculateBilledHours(booking);
            totalAmount = rate.multiply(hoursBilled);
        }

        String invoiceNumber = generateInvoiceNumber();
        Institution institution = booking.getUser().getInstitution();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .institution(institution)
                .booking(booking)
                .totalAmount(totalAmount)
                .hoursBilled(hoursBilled)
                .hourlyRate(rate)
                .taxAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(30))
                .build();

        invoiceRepository.save(invoice);
        log.info("Invoice generated from booking {} with amount: {}", bookingId, totalAmount);
        return toResponse(invoice);
    }

    private BigDecimal calculateBilledHours(Booking booking) {
        LocalDateTime start;
        LocalDateTime end;
        if (booking.getActualStartTime() != null && booking.getActualEndTime() != null
                && booking.getActualEndTime().isAfter(booking.getActualStartTime())) {
            start = booking.getActualStartTime();
            end = booking.getActualEndTime();
        } else {
            start = booking.getBookingDate().atTime(booking.getStartTime());
            end = booking.getBookingDate().atTime(booking.getEndTime());
        }
        long minutes = Duration.between(start, end).toMinutes();
        if (minutes <= 0) minutes = 60;
        return BigDecimal.valueOf(minutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<InvoiceResponse> getInvoicesByInstitution(Long institutionId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Invoice> invoicePage = invoiceRepository.findByInstitutionIdOrderByGeneratedAtDesc(institutionId, pageable);
        return toPaginatedResponse(invoicePage);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<InvoiceResponse> getOverdueInvoices(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Invoice> invoicePage = invoiceRepository.findByPaymentStatusOrderByDueDateAsc(PaymentStatus.PENDING, pageable);
        return toPaginatedResponse(invoicePage);
    }

    private PaginatedResponse<InvoiceResponse> toPaginatedResponse(Page<Invoice> page) {
        List<InvoiceResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.<InvoiceResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    private String generateInvoiceNumber() {
        long count = invoiceRepository.count() + 1;
        return "INV-" + Year.now().getValue() + "-" + String.format("%06d", count);
    }

    private InvoiceResponse toResponse(Invoice invoice) {
        BigDecimal amountPaid = calculateAmountPaid(invoice.getId());
        BigDecimal totalAmount = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .institutionId(invoice.getInstitution().getId())
                .institutionName(invoice.getInstitution().getInstitutionName())
                .bookingId(invoice.getBooking() != null ? invoice.getBooking().getId() : null)
                .equipmentName(invoice.getBooking() != null && invoice.getBooking().getEquipment() != null
                        ? invoice.getBooking().getEquipment().getEquipmentName() : null)
                .bookingUser(invoice.getBooking() != null && invoice.getBooking().getUser() != null
                        ? invoice.getBooking().getUser().getFullName() : null)
                .totalAmount(invoice.getTotalAmount())
                .hoursBilled(invoice.getHoursBilled())
                .hourlyRate(invoice.getHourlyRate())
                .taxAmount(invoice.getTaxAmount())
                .amountPaid(amountPaid)
                .amountDue(totalAmount.subtract(amountPaid))
                .paymentStatus(invoice.getPaymentStatus().name())
                .dueDate(invoice.getDueDate())
                .generatedAt(invoice.getGeneratedAt())
                .build();
    }

    public String generateInvoicePdf(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));
        InvoiceResponse response = toResponse(invoice);

        File invoicesDir = new File(uploadDir, "invoices");
        if (!invoicesDir.exists()) {
            invoicesDir.mkdirs();
        }

        String fileName = "invoice_" + invoice.getInvoiceNumber() + ".pdf";
        File file = new File(invoicesDir, fileName);

        try (PdfWriter writer = new PdfWriter(file);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc)) {

            PdfFont boldFont = PdfFontFactory.createFont();
            PdfFont regularFont = PdfFontFactory.createFont();

            document.add(new Paragraph("LAB RESOURCE UTILIZATION PLATFORM")
                    .setFont(boldFont).setFontSize(18)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Invoice")
                    .setFont(boldFont).setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph(" "));
            document.add(new LineSeparator(new SolidLine()));
            document.add(new Paragraph(" "));

            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{3, 7})).useAllAvailableWidth();
            addInfoRow(infoTable, "Invoice Number:", response.getInvoiceNumber());
            addInfoRow(infoTable, "Institution:", response.getInstitutionName());
            if (response.getEquipmentName() != null) {
                addInfoRow(infoTable, "Equipment:", response.getEquipmentName());
            }
            if (response.getBookingUser() != null) {
                addInfoRow(infoTable, "Booked By:", response.getBookingUser());
            }
            if (response.getHoursBilled() != null) {
                addInfoRow(infoTable, "Hours Billed:", response.getHoursBilled().stripTrailingZeros().toPlainString() + " hrs");
            }
            if (response.getHourlyRate() != null) {
                addInfoRow(infoTable, "Hourly Rate:", "₹" + response.getHourlyRate().stripTrailingZeros().toPlainString());
            }
            addInfoRow(infoTable, "Status:", response.getPaymentStatus());
            addInfoRow(infoTable, "Due Date:", response.getDueDate() != null ? response.getDueDate().toString() : "N/A");
            addInfoRow(infoTable, "Generated:", response.getGeneratedAt() != null ? response.getGeneratedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "N/A");
            document.add(infoTable);

            document.add(new Paragraph(" "));
            document.add(new LineSeparator(new SolidLine()));
            document.add(new Paragraph(" "));

            Table amountTable = new Table(UnitValue.createPercentArray(new float[]{5, 5})).useAllAvailableWidth();
            amountTable.addHeaderCell(new Cell().add(new Paragraph("Description").setFont(boldFont)));
            amountTable.addHeaderCell(new Cell().add(new Paragraph("Amount").setFont(boldFont)).setTextAlignment(TextAlignment.RIGHT));
            if (response.getHoursBilled() != null && response.getHourlyRate() != null) {
                String usageLabel = "Usage (" + response.getHoursBilled().stripTrailingZeros().toPlainString()
                        + " hrs x ₹" + response.getHourlyRate().stripTrailingZeros().toPlainString() + ")";
                amountTable.addCell(usageLabel);
                amountTable.addCell(response.getTotalAmount() != null ? "₹" + response.getTotalAmount() : "₹0").setTextAlignment(TextAlignment.RIGHT);
            } else {
                amountTable.addCell("Usage Charges");
                amountTable.addCell(response.getTotalAmount() != null ? "₹" + response.getTotalAmount() : "₹0").setTextAlignment(TextAlignment.RIGHT);
            }
            amountTable.addCell("Tax");
            amountTable.addCell(response.getTaxAmount() != null ? "₹" + response.getTaxAmount() : "₹0").setTextAlignment(TextAlignment.RIGHT);
            amountTable.addCell("Amount Paid");
            amountTable.addCell(response.getAmountPaid() != null ? "₹" + response.getAmountPaid() : "₹0").setTextAlignment(TextAlignment.RIGHT);
            amountTable.addCell(new Cell().add(new Paragraph("Amount Due").setFont(boldFont)));
            amountTable.addCell(new Cell().add(new Paragraph(response.getAmountDue() != null ? "₹" + response.getAmountDue() : "₹0").setFont(boldFont))).setTextAlignment(TextAlignment.RIGHT);
            document.add(amountTable);

            log.info("Invoice PDF generated: {}", file.getAbsolutePath());
        } catch (Exception e) {
            log.error("Failed to generate invoice PDF for invoice {}", invoiceId, e);
            throw new BadRequestException("Failed to generate invoice PDF: " + e.getMessage());
        }

        return file.getAbsolutePath();
    }

    private void addInfoRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setBold()));
        table.addCell(new Cell().add(new Paragraph(value != null ? value : "")));
    }

    private BigDecimal calculateAmountPaid(Long invoiceId) {
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
        return payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PAID)
                .map(Payment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
