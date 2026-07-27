package com.labresource.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaintenanceScheduleCreate {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Maintenance type is required (PREVENTIVE, CALIBRATION, INSPECTION)")
    private String maintenanceType;

    @NotNull(message = "Interval days is required")
    @Min(value = 1, message = "Interval must be at least 1 day")
    private Integer intervalDays;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    @Size(max = 500)
    private String notes;
}
