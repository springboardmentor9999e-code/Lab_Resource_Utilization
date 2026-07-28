package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.InvoiceRequest;
import com.lrplatform.dto.response.InvoiceResponse;
import com.lrplatform.dto.response.PaginatedResponse;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.Year;
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

        BigDecimal rate = equipment.getHourlyRate() != null ? equipment.getHourlyRate() : equipment.getPurchaseCost();
        if (rate != null) {
            long hours = Duration.between(booking.getStartTime(), booking.getEndTime()).toHours();
            if (hours <= 0) hours = 1;
            totalAmount = rate.multiply(BigDecimal.valueOf(hours));
        }

        String invoiceNumber = generateInvoiceNumber();
        Institution institution = booking.getUser().getInstitution();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .institution(institution)
                .booking(booking)
                .totalAmount(totalAmount)
                .taxAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PENDING)
                .dueDate(LocalDate.now().plusDays(30))
                .build();

        invoiceRepository.save(invoice);
        log.info("Invoice generated from booking {} with amount: {}", bookingId, totalAmount);
        return toResponse(invoice);
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
                .taxAmount(invoice.getTaxAmount())
                .amountPaid(amountPaid)
                .amountDue(totalAmount.subtract(amountPaid))
                .paymentStatus(invoice.getPaymentStatus().name())
                .dueDate(invoice.getDueDate())
                .generatedAt(invoice.getGeneratedAt())
                .build();
    }

    private BigDecimal calculateAmountPaid(Long invoiceId) {
        List<Payment> payments = paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
        return payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PAID)
                .map(Payment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
