package com.labresource.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateMaintenanceRequest(
        @NotNull(message = "Equipment id is required")
        Long equipmentId,

        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must not exceed 150 characters")
        String title,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @NotNull(message = "Scheduled start time is required")
        LocalDateTime scheduledStartTime,

        @NotNull(message = "Scheduled end time is required")
        LocalDateTime scheduledEndTime,

        @Size(max = 150, message = "Technician name must not exceed 150 characters")
        String technicianName,

        @Size(max = 1000, message = "Notes must not exceed 1000 characters")
        String notes
) {
}
