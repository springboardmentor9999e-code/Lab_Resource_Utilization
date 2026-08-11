package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.BillingRecord;
import com.labplatform.labresourceplatform.entity.User;
import com.labplatform.labresourceplatform.security.CurrentUserService;
import com.labplatform.labresourceplatform.service.BillingRecordService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing-records")
public class BillingRecordController {

    private final BillingRecordService billingRecordService;
    private final CurrentUserService currentUserService;

    public BillingRecordController(BillingRecordService billingRecordService, CurrentUserService currentUserService) {
        this.billingRecordService = billingRecordService;
        this.currentUserService = currentUserService;
    }

    // Billing is inherently institution-level financial data, so this is
    // restricted to management-tier roles rather than the platform-wide
    // Read-tier used for Equipment/Maintenance/Calibration - a STUDENT or
    // RESEARCHER has no reason to see cross-institution charges.
    @GetMapping
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public List<BillingRecord> getVisibleBillingRecords() {
        User currentUser = currentUserService.getCurrentUser();
        return billingRecordService.getVisibleBillingRecords(currentUser);
    }

    // Marking a bill Invoiced/Paid is restricted to the owning institution
    // (whoever is owed the money) - enforced again inside the service since
    // "own institution" can't be expressed in @PreAuthorize alone.
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR')")
    public BillingRecord updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User currentUser = currentUserService.getCurrentUser();
        return billingRecordService.markStatus(id, body.get("status"), currentUser);
    }
}
