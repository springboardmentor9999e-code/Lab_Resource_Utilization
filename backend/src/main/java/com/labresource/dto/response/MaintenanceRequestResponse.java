package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class MaintenanceRequestResponse {
    private Long requestId;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String labName;
    private String requestedByName;
    private Long assignedToId;
    private String assignedToName;
    private String type;     // PREVENTIVE | CORRECTIVE | CALIBRATION | INSPECTION
    private String priority; // LOW | MEDIUM | HIGH | CRITICAL
    private String title;
    private String description;
    private String status;   // OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED
    private LocalDate scheduledDate;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long downtimeMinutes;
    private String resolutionNotes;
    private BigDecimal cost;
    private LocalDateTime createdAt;
}
