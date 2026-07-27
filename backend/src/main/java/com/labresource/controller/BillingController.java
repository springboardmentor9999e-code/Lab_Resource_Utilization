package com.labresource.controller;

import com.labresource.entity.Department;
import com.labresource.service.impl.BillingService;
import com.labresource.service.impl.ChargebackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private static final String MANAGERS =
            "hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER')";

    private final BillingService billingService;
    private final ChargebackService chargebackService;

    // ----- Cost analysis -----

    @GetMapping("/costs/equipment")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getEquipmentCosts(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(billingService.getEquipmentCosts(days));
    }

    @GetMapping("/costs/departments")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getDepartmentCosts(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(billingService.getDepartmentCosts(days));
    }

    @GetMapping("/department-charges/{departmentId}")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getDepartmentCharges(
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(billingService.getDepartmentCharges(departmentId, days));
    }

    // ----- Budget -----

    /**
     * Sets a department's annual budget. Omitting the amount clears it, which puts the
     * department back to "not tracked" rather than to a budget of zero — reporting
     * distinguishes the two, and only one of them is a real budget.
     */
    @PutMapping("/departments/{departmentId}/budget")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<Map<String, Object>> setAnnualBudget(
            @PathVariable Long departmentId,
            @RequestParam(required = false) BigDecimal annualBudget) {
        Department saved = chargebackService.setAnnualBudget(departmentId, annualBudget);
        return ResponseEntity.ok(Map.of(
                "departmentId", saved.getDepartmentId(),
                "departmentName", saved.getName(),
                "annualBudget", saved.getAnnualBudget() != null
                        ? saved.getAnnualBudget() : "NOT_SET"));
    }

    // ----- Invoices -----

    @PostMapping("/invoices/from-sharing/{sharingRequestId}")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<Map<String, Object>> generateInvoice(
            @PathVariable Long sharingRequestId, Principal principal) {
        return new ResponseEntity<>(
                billingService.generateInvoiceFromSharing(sharingRequestId, principal.getName()),
                HttpStatus.CREATED);
    }

    @GetMapping("/invoices/outgoing")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getOutgoing(Principal principal) {
        return ResponseEntity.ok(billingService.getOutgoingInvoices(principal.getName()));
    }

    @GetMapping("/invoices/incoming")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getIncoming(Principal principal) {
        return ResponseEntity.ok(billingService.getIncomingInvoices(principal.getName()));
    }

    @PatchMapping("/invoices/{id}/status")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id, @RequestParam String status, Principal principal) {
        return ResponseEntity.ok(billingService.updateInvoiceStatus(id, status, principal.getName()));
    }

    // ----- Summary -----

    @GetMapping("/summary")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam(defaultValue = "30") int days, Principal principal) {
        return ResponseEntity.ok(billingService.getBillingSummary(principal.getName(), days));
    }
}
