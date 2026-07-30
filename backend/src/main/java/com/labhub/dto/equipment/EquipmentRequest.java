package com.labhub.dto.equipment;

import com.labhub.enums.EquipmentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request DTO for creating or updating equipment.
 */
@Data
public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    private String name;

    private String serialNumber;

    private String manufacturer;

    private String model;

    private LocalDate purchaseDate;

    private String location;

    private String description;

    private String imageUrl;

    @NotNull(message = "Status is required")
    private EquipmentStatus status;

    private UUID categoryId;

    private UUID departmentId;
}
