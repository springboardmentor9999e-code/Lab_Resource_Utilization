package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BillingResponse {

    private Long billingId;

    private Long bookingId;

    private String institutionName;

    private String departmentName;

    private String laboratoryName;

    private String equipmentName;

    private Double equipmentCost;

    private Double laboratoryCost;

    private Double totalCost;

    private String paymentStatus;

    private String generatedDate;
}