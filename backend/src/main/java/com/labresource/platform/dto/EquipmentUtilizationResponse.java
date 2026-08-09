package com.labresource.platform.dto;

public record EquipmentUtilizationResponse(
        Long equipmentId,
        String equipmentName,
        String category,
        String serialNumber,
        Integer totalQuantity,
        long approvedBookingCount,
        long approvedBookedUnits,
        double utilizationPercentage
) {
}
