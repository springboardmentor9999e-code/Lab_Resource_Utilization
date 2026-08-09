package com.labresource.platform.dto;

public record LabUtilizationResponse(
        Long labId,
        String labName,
        String building,
        String roomNumber,
        Integer capacity,
        long equipmentRecords,
        long equipmentUnits,
        long approvedBookingCount,
        long approvedBookedUnits,
        double utilizationPercentage
) {
}
