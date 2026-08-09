package com.labresource.platform.dto;

import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.entity.Lab;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record EquipmentResponse(
        Long id,
        String name,
        String category,
        String manufacturer,
        String serialNumber,
        Integer quantity,
        Integer availableQuantity,
        EquipmentStatus status,
        LocalDate purchaseDate,
        Long labId,
        String labName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static EquipmentResponse from(Equipment equipment) {
        Lab lab = equipment.getLab();

        return new EquipmentResponse(
                equipment.getId(),
                equipment.getName(),
                equipment.getCategory(),
                equipment.getManufacturer(),
                equipment.getSerialNumber(),
                equipment.getQuantity(),
                equipment.getAvailableQuantity(),
                equipment.getStatus(),
                equipment.getPurchaseDate(),
                lab.getId(),
                lab.getName(),
                equipment.getCreatedAt(),
                equipment.getUpdatedAt()
        );
    }
}
