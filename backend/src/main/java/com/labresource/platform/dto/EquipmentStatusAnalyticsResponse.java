package com.labresource.platform.dto;

public record EquipmentStatusAnalyticsResponse(
        long available,
        long inUse,
        long maintenance,
        long outOfService
) {
}
