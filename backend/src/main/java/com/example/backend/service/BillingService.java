package com.example.backend.service;

import com.example.backend.dto.BillingDTO;
import com.example.backend.entity.Billing;

import java.util.List;

public interface BillingService {

    List<BillingDTO> getAllBillings();

    BillingDTO getBillingById(Long id);

    List<BillingDTO> getBillingsByUserId(Long userId);

    BillingDTO createBilling(Billing billing);

    BillingDTO generateInvoiceForBooking(Long bookingId);

    BillingDTO updatePaymentStatus(Long id, String status, String paymentReference);

    void deleteBilling(Long id);
}
