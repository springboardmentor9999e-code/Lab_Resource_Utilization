package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalBookingRequestResponse {
    private Long id;
    private Long sharedEquipmentId;
    private String equipmentName;
    private Long requestingInstitutionId;
    private String requestingInstitutionName;
    private Long requestedByUserId;
    private String requestedByUserName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private String status;
    private Long approvedByUserId;
    private String approvedByUserName;
    private LocalDateTime createdAt;
}
