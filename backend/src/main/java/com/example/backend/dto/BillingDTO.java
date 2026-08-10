package com.example.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BillingDTO {

    private Long id;
    private Long bookingId;
    private Long equipmentId;
    private String equipmentName;
    private Long userId;
    private String userName;
    private Integer requesterInstitutionId;
    private String requesterInstitutionName;
    private Integer ownerInstitutionId;
    private String ownerInstitutionName;
    private BigDecimal hoursUsed;
    private BigDecimal hourlyRate;
    private BigDecimal totalCost;
    private LocalDate billingDate;
    private String status;
    private String paymentReference;
    private LocalDateTime createdAt;
}
