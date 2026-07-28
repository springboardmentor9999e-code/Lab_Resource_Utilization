package com.lrplatform.controller;

import com.lrplatform.dto.request.PaymentRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.dto.response.PaymentResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaginatedResponse<PaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            return ResponseEntity.ok(paymentService.getAllPaymentsByInstitution(myInstitutionId, page, size, dateFrom, dateTo));
        }
        return ResponseEntity.ok(paymentService.getAllPayments(page, size, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id, HttpServletRequest request) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaymentResponse> recordPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.recordPayment(request));
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(paymentService.getPaymentsByInvoice(invoiceId));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentSummary(HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            return ResponseEntity.ok(paymentService.getPaymentSummaryByInstitution(myInstitutionId));
        }
        return ResponseEntity.ok(paymentService.getPaymentSummary());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully"));
    }
}
