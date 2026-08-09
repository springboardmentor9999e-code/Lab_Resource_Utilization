package com.labresource.platform.dto;

public record BookingStatusAnalyticsResponse(
        long pending,
        long approved,
        long rejected,
        long cancelled,
        long completed
) {
}
