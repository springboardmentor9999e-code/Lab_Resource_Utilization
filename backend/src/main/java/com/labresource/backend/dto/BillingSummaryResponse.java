package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillingSummaryResponse {

    private Double totalRevenue;

    private Long totalInvoices;

    private Long pendingPayments;

    private Long paidInvoices;

    private Double averageInvoiceValue;

}