package com.labresource.platform.dto;

import java.util.List;

public record AnalyticsOverviewResponse(
        DashboardSummaryResponse dashboard,
        BookingStatusAnalyticsResponse bookingStatus,
        EquipmentStatusAnalyticsResponse equipmentStatus,
        List<LabUtilizationResponse> labUtilization,
        List<EquipmentUtilizationResponse> equipmentUtilization
) {
}
