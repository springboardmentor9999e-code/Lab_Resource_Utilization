package com.labresource.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateLabRequest(
        @NotBlank(message = "Lab name is required")
        @Size(max = 150, message = "Lab name must not exceed 150 characters")
        String name,

        @NotBlank(message = "Building is required")
        @Size(max = 100, message = "Building must not exceed 100 characters")
        String building,

        @NotBlank(message = "Room number is required")
        @Size(max = 50, message = "Room number must not exceed 50 characters")
        String roomNumber,

        @NotNull(message = "Capacity is required")
        @Positive(message = "Capacity must be greater than zero")
        Integer capacity,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @NotNull(message = "Active status is required")
        Boolean active
) {
}
