package com.labresource.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateBookingRequest(
        @NotNull(message = "Equipment id is required")
        Long equipmentId,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity,

        @NotNull(message = "Start time is required")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime,

        @NotBlank(message = "Purpose is required")
        @Size(max = 1000, message = "Purpose must not exceed 1000 characters")
        String purpose
) {
}
