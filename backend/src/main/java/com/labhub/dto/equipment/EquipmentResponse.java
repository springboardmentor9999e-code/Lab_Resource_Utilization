package com.labhub.dto.equipment;

import com.labhub.enums.EquipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for equipment data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {

    private UUID id;
    private String name;
    private String serialNumber;
    private String manufacturer;
    private String model;
    private LocalDate purchaseDate;
    private String location;
    private String description;
    private String imageUrl;
    private EquipmentStatus status;

    private UUID categoryId;
    private String categoryName;

    private UUID departmentId;
    private String departmentName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}
