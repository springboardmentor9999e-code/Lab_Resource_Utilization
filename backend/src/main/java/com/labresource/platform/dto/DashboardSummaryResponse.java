package com.labresource.platform.dto;

public record DashboardSummaryResponse(
        long totalLabs,
        long activeLabs,
        long totalEquipmentRecords,
        long totalEquipmentUnits,
        long availableEquipmentUnits,
        long pendingBookings,
        long approvedBookings,
        long activeMaintenanceRecords
) {
}
