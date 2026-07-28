package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.PaymentRequest;
import com.lrplatform.dto.response.PaymentResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Invoice;
import com.lrplatform.model.entity.Payment;
import com.lrplatform.model.enums.PaymentStatus;
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
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<PaymentResponse> getAllPayments(int page, int size, LocalDateTime dateFrom, LocalDateTime dateTo) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentPage;

        if (dateFrom != null && dateTo != null) {
            paymentPage = paymentRepository.findByPaymentDateBetweenOrderByPaymentDateDesc(dateFrom, dateTo, pageable);
        } else {
            paymentPage = paymentRepository.findAll(pageable);
        }

        return toPaginatedResponse(paymentPage);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<PaymentResponse> getAllPaymentsByInstitution(Long institutionId, int page, int size, LocalDateTime dateFrom, LocalDateTime dateTo) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentPage;

        if (dateFrom != null && dateTo != null) {
            paymentPage = paymentRepository.findByInstitutionIdAndPaymentDateBetween(institutionId, dateFrom, dateTo, pageable);
        } else {
            paymentPage = paymentRepository.findByInstitutionId(institutionId, pageable);
        }

        return toPaginatedResponse(paymentPage);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return toResponse(payment);
    }

    @Auditable(module = "PAYMENT", action = "CREATE", entityType = "Payment")
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found"));

        BigDecimal totalPaid = calculateTotalPaidForInvoice(invoice.getId());
        BigDecimal newTotalPaid = totalPaid.add(request.getAmountPaid());
        BigDecimal totalAmount = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;

        PaymentStatus paymentStatus;
        if (newTotalPaid.compareTo(totalAmount) >= 0) {
            paymentStatus = PaymentStatus.PAID;
        } else {
            paymentStatus = PaymentStatus.PARTIALLY_PAID;
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amountPaid(request.getAmountPaid())
                .paymentMethod(request.getPaymentMethod())
                .paymentReference(request.getPaymentReference())
                .paymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDateTime.now())
                .paymentStatus(paymentStatus)
                .build();

        paymentRepository.save(payment);

        invoice.setPaymentStatus(paymentStatus);
        invoiceRepository.save(invoice);

        log.info("Payment recorded: {} for invoice: {}", request.getAmountPaid(), invoice.getInvoiceNumber());
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentSummary() {
        BigDecimal totalPaid = paymentRepository.sumTotalPaid();
        BigDecimal totalPending = invoiceRepository.sumPendingAmount();
        BigDecimal totalOverdue = invoiceRepository.sumOverdueAmount();

        List<Object[]> methodBreakdown = paymentRepository.countByPaymentMethod();
        Map<String, Map<String, Object>> paymentMethodBreakdown = new HashMap<>();
        for (Object[] row : methodBreakdown) {
            String method = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal amount = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            Map<String, Object> methodInfo = new HashMap<>();
            methodInfo.put("count", count);
            methodInfo.put("totalAmount", amount);
            paymentMethodBreakdown.put(method, methodInfo);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaid", totalPaid);
        summary.put("totalPending", totalPending);
        summary.put("totalOverdue", totalOverdue);
        summary.put("paymentMethodBreakdown", paymentMethodBreakdown);
        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentSummaryByInstitution(Long institutionId) {
        BigDecimal totalPaid = paymentRepository.sumTotalPaidByInstitution(institutionId);
        BigDecimal totalPending = invoiceRepository.sumPendingAmountByInstitution(institutionId);
        BigDecimal totalOverdue = invoiceRepository.sumOverdueAmountByInstitution(institutionId);

        List<Object[]> methodBreakdown = paymentRepository.countByPaymentMethodByInstitution(institutionId);
        Map<String, Map<String, Object>> paymentMethodBreakdown = new HashMap<>();
        for (Object[] row : methodBreakdown) {
            String method = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            BigDecimal amount = row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO;
            Map<String, Object> methodInfo = new HashMap<>();
            methodInfo.put("count", count);
            methodInfo.put("totalAmount", amount);
            paymentMethodBreakdown.put(method, methodInfo);
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalPaid", totalPaid);
        summary.put("totalPending", totalPending);
        summary.put("totalOverdue", totalOverdue);
        summary.put("paymentMethodBreakdown", paymentMethodBreakdown);
        return summary;
    }

    private PaginatedResponse<PaymentResponse> toPaginatedResponse(Page<Payment> page) {
        List<PaymentResponse> content = page.getContent().stream()
                .map(this::toResponse)
                .toList();
        return PaginatedResponse.<PaymentResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    private PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .invoiceNumber(payment.getInvoice().getInvoiceNumber())
                .amountPaid(payment.getAmountPaid())
                .paymentReference(payment.getPaymentReference())
                .paymentMethod(payment.getPaymentMethod())
                .paymentDate(payment.getPaymentDate())
                .paymentStatus(payment.getPaymentStatus().name())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private BigDecimal calculateTotalPaidForInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PAID)
                .map(Payment::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Auditable(module = "PAYMENT", action = "DELETE", entityType = "Payment")
    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        Invoice invoice = payment.getInvoice();
        paymentRepository.delete(payment);

        BigDecimal remainingPaid = calculateTotalPaidForInvoice(invoice.getId());
        BigDecimal totalAmount = invoice.getTotalAmount() != null ? invoice.getTotalAmount() : BigDecimal.ZERO;

        PaymentStatus newStatus;
        if (remainingPaid.compareTo(BigDecimal.ZERO) == 0) {
            newStatus = PaymentStatus.PENDING;
        } else if (remainingPaid.compareTo(totalAmount) >= 0) {
            newStatus = PaymentStatus.PAID;
        } else {
            newStatus = PaymentStatus.PARTIALLY_PAID;
        }

        invoice.setPaymentStatus(newStatus);
        invoiceRepository.save(invoice);
        log.info("Payment deleted: {} for invoice: {}", id, invoice.getInvoiceNumber());
    }
}
