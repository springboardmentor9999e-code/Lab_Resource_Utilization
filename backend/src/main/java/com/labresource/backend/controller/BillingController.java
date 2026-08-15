package com.labresource.backend.controller;

import com.labresource.backend.dto.BillingResponse;
import com.labresource.backend.dto.BillingSummaryResponse;
import com.labresource.backend.dto.DepartmentCostResponse;
import com.labresource.backend.entity.Billing;
import com.labresource.backend.service.BillingService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/summary")
    public BillingSummaryResponse getBillingSummary() {
        return billingService.getBillingSummary();
    }

    @GetMapping("/all")
    public List<BillingResponse> getAllBilling() {
        return billingService.getAllBilling();
    }

    @GetMapping("/my")
    public List<BillingResponse> getMyBilling(Authentication authentication) {

        return billingService.getMyBilling(authentication);

    }

    @GetMapping("/department-billing/{userId}")
    public List<BillingResponse> getDepartmentBilling(
            @PathVariable Long userId) {

        return billingService.getDepartmentBilling(userId);
    }

    @GetMapping("/institution/{institutionId}")
    public List<BillingResponse> getInstitutionBilling(
            @PathVariable Long institutionId) {

        return billingService.getInstitutionBilling(institutionId);
    }

    @GetMapping("/department")
    public List<DepartmentCostResponse> getDepartmentWiseCost() {
        return billingService.getDepartmentWiseCost();
    }
    
    @PutMapping("/{billingId}/pay")
    public ResponseEntity<Billing> markAsPaid(@PathVariable Long billingId) {
        return ResponseEntity.ok(billingService.markAsPaid(billingId));
    }
    
    

}