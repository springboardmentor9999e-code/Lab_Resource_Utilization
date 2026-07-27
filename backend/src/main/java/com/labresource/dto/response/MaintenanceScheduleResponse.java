package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class MaintenanceScheduleResponse {
    private Long scheduleId;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String maintenanceType;
    private Integer intervalDays;
    private LocalDate nextDueDate;
    private LocalDate lastGeneratedDate;
    private String notes;
    private Boolean active;
    private String createdByName;
}
