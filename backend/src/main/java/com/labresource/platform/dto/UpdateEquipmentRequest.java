package com.labresource.platform.dto;

import com.labresource.platform.entity.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateEquipmentRequest(
        @NotBlank(message = "Equipment name is required")
        @Size(max = 150, message = "Equipment name must not exceed 150 characters")
        String name,

        @NotBlank(message = "Category is required")
        @Size(max = 100, message = "Category must not exceed 100 characters")
        String category,

        @NotBlank(message = "Manufacturer is required")
        @Size(max = 150, message = "Manufacturer must not exceed 150 characters")
        String manufacturer,

        @NotBlank(message = "Serial number is required")
        @Size(max = 100, message = "Serial number must not exceed 100 characters")
        String serialNumber,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        Integer quantity,

        @NotNull(message = "Available quantity is required")
        @PositiveOrZero(message = "Available quantity must not be negative")
        Integer availableQuantity,

        @NotNull(message = "Status is required")
        EquipmentStatus status,

        @NotNull(message = "Purchase date is required")
        @PastOrPresent(message = "Purchase date must not be in the future")
        LocalDate purchaseDate,

        @NotNull(message = "Lab id is required")
        Long labId
) {
}
