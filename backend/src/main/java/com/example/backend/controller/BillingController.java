package com.example.backend.controller;

import com.example.backend.dto.BillingDTO;
import com.example.backend.entity.Billing;
import com.example.backend.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "http://localhost:3000")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping
    public ResponseEntity<List<BillingDTO>> getAllBillings() {
        return ResponseEntity.ok(billingService.getAllBillings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingDTO> getBillingById(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBillingById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BillingDTO>> getBillingsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(billingService.getBillingsByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<BillingDTO> createBilling(@RequestBody Billing billing) {
        return ResponseEntity.ok(billingService.createBilling(billing));
    }

    @PostMapping("/generate/{bookingId}")
    public ResponseEntity<BillingDTO> generateInvoice(@PathVariable Long bookingId) {
        return ResponseEntity.ok(billingService.generateInvoiceForBooking(bookingId));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<BillingDTO> updatePaymentStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PAID");
        String ref = payload.getOrDefault("paymentReference", "TXN-" + System.currentTimeMillis());
        return ResponseEntity.ok(billingService.updatePaymentStatus(id, status, ref));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        billingService.deleteBilling(id);
        return ResponseEntity.noContent().build();
    }
}
