package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.DepartmentStatDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.UtilizationPointDTO;
import com.project.Lab.Resource.Utilization.Platform.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // =========================================================
    // WEEKLY UTILIZATION ANALYTICS
    // =========================================================

    @GetMapping("/utilization")
    @PreAuthorize("isAuthenticated()")
    public List<UtilizationPointDTO> getWeeklyUtilization() {
        return analyticsService.getWeeklyUtilization();
    }

    // =========================================================
    // DEPARTMENT ANALYTICS
    // =========================================================

    @GetMapping("/departments")
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentStatDTO> getDepartmentStatistics() {
        return analyticsService.getDepartmentStatistics();
    }
}