package com.example.hello.service;

import com.example.hello.entity.Billing;
import com.example.hello.repository.BillingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillingService {

    @Autowired
    private BillingRepository repository;


    // Get all billing records
    public List<Billing> getAllBills() {

        return repository.findAll();

    }


    // Mark billing as PAID
    public Billing markAsPaid(Integer billingId) {

        Billing billing = repository.findById(billingId)
                .orElse(null);

        if (billing == null) {
            return null;
        }

        billing.setBillingStatus("PAID");

        return repository.save(billing);

    }

}