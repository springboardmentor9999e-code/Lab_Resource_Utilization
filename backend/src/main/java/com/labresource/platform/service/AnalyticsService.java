package com.labresource.platform.service;

import com.labresource.platform.dto.AnalyticsOverviewResponse;
import com.labresource.platform.dto.BookingStatusAnalyticsResponse;
import com.labresource.platform.dto.DashboardSummaryResponse;
import com.labresource.platform.dto.EquipmentStatusAnalyticsResponse;
import com.labresource.platform.dto.EquipmentUtilizationResponse;
import com.labresource.platform.dto.LabUtilizationResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsService {

    DashboardSummaryResponse getDashboardSummary();

    BookingStatusAnalyticsResponse getBookingStatusAnalytics();

    EquipmentStatusAnalyticsResponse getEquipmentStatusAnalytics();

    List<LabUtilizationResponse> getLabUtilization(LocalDateTime from, LocalDateTime to);

    List<EquipmentUtilizationResponse> getEquipmentUtilization(LocalDateTime from, LocalDateTime to);

    AnalyticsOverviewResponse getAnalyticsOverview(LocalDateTime from, LocalDateTime to);
}
