package com.labresource.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharingRequestResponse {

    private Long sharingRequestId;

    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String equipmentCategory;

    private Long fromInstitutionId;
    private String fromInstitutionName;

    private Long toInstitutionId;
    private String toInstitutionName;

    private Long requestedById;
    private String requestedByName;
    private String requestedByEmail;

    private Long approvedById;
    private String approvedByName;

    private String purpose;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;

    // PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED
    private String status;
    private String remarks;

    // Usage fee (snapshot at request time): rate per hour, duration, estimated total
    private java.math.BigDecimal hourlyRate;
    private Double durationHours;
    private java.math.BigDecimal estimatedFee;

    private LocalDateTime createdAt;
}
