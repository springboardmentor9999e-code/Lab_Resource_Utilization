package com.example.hello.controller;

import com.example.hello.entity.Billing;
import com.example.hello.service.BillingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/billing")
@CrossOrigin
public class BillingController {

    @Autowired
    private BillingService billingService;


    // GET all billing records
    @GetMapping
    public List<Billing> getAllBills() {

        return billingService.getAllBills();

    }


    // Mark bill as PAID
    @PutMapping("/{id}/pay")
    public ResponseEntity<Billing> markAsPaid(
            @PathVariable Integer id) {

        Billing billing = billingService.markAsPaid(id);

        if (billing == null) {

            return ResponseEntity.notFound().build();

        }

        return ResponseEntity.ok(billing);

    }

}