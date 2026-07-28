package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceWorkOrderResponse {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String maintenanceType;
    private String priority;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private String status;
    private String description;
    private LocalDate scheduledDate;
    private LocalDate completionDate;
    private BigDecimal downtimeHours;
    private BigDecimal totalCost;
    private String remarks;
    private String partsUsed;
    private BigDecimal laborHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
