package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MaintenanceRequestCreate {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotBlank(message = "Type is required (PREVENTIVE, CORRECTIVE, CALIBRATION, INSPECTION)")
    private String type;

    private String priority; // LOW | MEDIUM | HIGH | CRITICAL (default MEDIUM)

    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    @Size(max = 1000)
    private String description;

    private LocalDate scheduledDate;
}
