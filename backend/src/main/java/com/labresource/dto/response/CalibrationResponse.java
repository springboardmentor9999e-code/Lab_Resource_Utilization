package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CalibrationResponse {
    private Long calibrationId;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private LocalDate calibrationDate;
    private LocalDate nextDueDate;
    private Long daysUntilDue; // negative = overdue
    private String certificateNumber;
    private String calibratedBy;
    private String remarks;
    private String createdByName;
    private LocalDateTime createdAt;
}
