package com.labresource.platform.controller;

import com.labresource.platform.dto.AnalyticsOverviewResponse;
import com.labresource.platform.dto.BookingStatusAnalyticsResponse;
import com.labresource.platform.dto.DashboardSummaryResponse;
import com.labresource.platform.dto.EquipmentStatusAnalyticsResponse;
import com.labresource.platform.dto.EquipmentUtilizationResponse;
import com.labresource.platform.dto.LabUtilizationResponse;
import com.labresource.platform.service.AnalyticsService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public DashboardSummaryResponse getDashboardSummary() {
        return analyticsService.getDashboardSummary();
    }

    @GetMapping("/bookings/status")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public BookingStatusAnalyticsResponse getBookingStatusAnalytics() {
        return analyticsService.getBookingStatusAnalytics();
    }

    @GetMapping("/equipment/status")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public EquipmentStatusAnalyticsResponse getEquipmentStatusAnalytics() {
        return analyticsService.getEquipmentStatusAnalytics();
    }

    @GetMapping("/labs/utilization")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<LabUtilizationResponse> getLabUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return analyticsService.getLabUtilization(from, to);
    }

    @GetMapping("/equipment/utilization")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<EquipmentUtilizationResponse> getEquipmentUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return analyticsService.getEquipmentUtilization(from, to);
    }

    @GetMapping("/overview")
    @PreAuthorize("hasAnyAuthority('ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public AnalyticsOverviewResponse getAnalyticsOverview(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to
    ) {
        return analyticsService.getAnalyticsOverview(from, to);
    }
}
