package com.lrplatform.controller;

import com.lrplatform.dto.request.InvoiceRequest;
import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.InvoiceResponse;
import com.lrplatform.dto.response.PaginatedResponse;
import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.model.entity.User;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.service.InvoiceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final CurrentUserUtil currentUserUtil;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaginatedResponse<InvoiceResponse>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long institutionId,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            institutionId = myInstitutionId;
        }
        return ResponseEntity.ok(invoiceService.getAllInvoices(page, size, status, institutionId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id, HttpServletRequest request) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(id);
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null || (invoice.getInstitutionId() != null && !myInstitutionId.equals(invoice.getInstitutionId()))) {
                throw new ForbiddenException("You can only view invoices within your institution");
            }
        }
        return ResponseEntity.ok(invoice);
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<InvoiceResponse> createInvoice(@RequestBody InvoiceRequest request, HttpServletRequest httpRequest) {
        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null) {
                throw new ForbiddenException("No institution assigned to your account");
            }
            request.setInstitutionId(myInstitutionId);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.createInvoice(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceRequest request,
            HttpServletRequest httpRequest) {
        InvoiceResponse existing = invoiceService.getInvoiceById(id);
        User currentUser = currentUserUtil.getCurrentUser(httpRequest);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null || (existing.getInstitutionId() != null && !myInstitutionId.equals(existing.getInstitutionId()))) {
                throw new ForbiddenException("You can only update invoices within your institution");
            }
        }
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully"));
    }

    @PostMapping("/generate-from-booking/{bookingId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN') or hasRole('LAB_MANAGER')")
    public ResponseEntity<InvoiceResponse> generateInvoiceFromBooking(@PathVariable Long bookingId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(invoiceService.generateInvoiceFromBooking(bookingId));
    }

    @GetMapping("/institution/{institutionId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaginatedResponse<InvoiceResponse>> getInvoicesByInstitution(
            @PathVariable Long institutionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId == null || !myInstitutionId.equals(institutionId)) {
                throw new ForbiddenException("You can only view invoices within your institution");
            }
        }
        return ResponseEntity.ok(invoiceService.getInvoicesByInstitution(institutionId, page, size));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('SYSTEM_ADMIN') or hasRole('INSTITUTION_ADMIN')")
    public ResponseEntity<PaginatedResponse<InvoiceResponse>> getOverdueInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        User currentUser = currentUserUtil.getCurrentUser(request);
        if (currentUser.getRole().name().equals("INSTITUTION_ADMIN")) {
            Long myInstitutionId = currentUser.getInstitution() != null ? currentUser.getInstitution().getId() : null;
            if (myInstitutionId != null) {
                return ResponseEntity.ok(invoiceService.getAllInvoices(page, size, "OVERDUE", myInstitutionId));
            }
        }
        return ResponseEntity.ok(invoiceService.getOverdueInvoices(page, size));
    }
}
