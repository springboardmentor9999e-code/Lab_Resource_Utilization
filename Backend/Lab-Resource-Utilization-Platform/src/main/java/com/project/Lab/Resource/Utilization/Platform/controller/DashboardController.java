package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.DashboardStatsDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.DepartmentStatDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.HeatmapDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.UtilizationPointDTO;
import com.project.Lab.Resource.Utilization.Platform.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    private AnalyticsService analyticsService;

    // =========================================================
    // GENERIC ROLE DASHBOARD
    // =========================================================

    @GetMapping("/role/{role}")
    @PreAuthorize("isAuthenticated()")
    public DashboardStatsDTO getDashboard(@PathVariable String role) {
        return analyticsService.getDashboardStats(role);
    }

    // =========================================================
    // STUDENT DASHBOARD
    // =========================================================

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public DashboardStatsDTO getStudentDashboard() {
        return analyticsService.getDashboardStats("STUDENT");
    }

    // =========================================================
    // RESEARCHER DASHBOARD
    // =========================================================

    @GetMapping("/researcher")
    @PreAuthorize("hasRole('RESEARCHER')")
    public DashboardStatsDTO getResearcherDashboard() {
        return analyticsService.getDashboardStats("RESEARCHER");
    }

    // =========================================================
    // LAB TECHNICIAN DASHBOARD
    // =========================================================

    @GetMapping("/lab-technician")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public DashboardStatsDTO getLabTechnicianDashboard() {
        return analyticsService.getDashboardStats("LAB_TECHNICIAN");
    }

    // =========================================================
    // LAB MANAGER DASHBOARD
    // =========================================================

    @GetMapping("/lab-manager")
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public DashboardStatsDTO getLabManagerDashboard() {
        return analyticsService.getDashboardStats("LAB_MANAGER");
    }

    // =========================================================
    // DEPARTMENT HEAD DASHBOARD
    // =========================================================

    @GetMapping("/department-head")
    @PreAuthorize("hasRole('DEPARTMENT_HEAD')")
    public DashboardStatsDTO getDepartmentHeadDashboard() {
        return analyticsService.getDashboardStats("DEPARTMENT_HEAD");
    }

    // =========================================================
    // INSTITUTION ADMIN DASHBOARD
    // =========================================================

    @GetMapping("/institution-admin")
    @PreAuthorize("hasRole('INSTITUTION_ADMIN')")
    public DashboardStatsDTO getInstitutionAdminDashboard() {
        return analyticsService.getDashboardStats("INSTITUTION_ADMIN");
    }

    // =========================================================
    // SYSTEM ADMIN DASHBOARD
    // =========================================================

    @GetMapping("/system-admin")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public DashboardStatsDTO getSystemAdminDashboard() {
        return analyticsService.getDashboardStats("SYSTEM_ADMIN");
    }

    // =========================================================
    // WEEKLY UTILIZATION
    // =========================================================

    @GetMapping("/utilization")
    @PreAuthorize("isAuthenticated()")
    public List<UtilizationPointDTO> getWeeklyUtilization() {
        return analyticsService.getWeeklyUtilization();
    }


    // =========================================================
    // EQUIPMENT HEATMAP
    // =========================================================

    @GetMapping("/heatmap")
    @PreAuthorize("isAuthenticated()")
    public List<HeatmapDTO> getEquipmentHeatmap() {
        return analyticsService.getEquipmentHeatmap();
    }

    // =========================================================
    // DEPARTMENT STATISTICS
    // =========================================================

    @GetMapping("/department-statistics")
    @PreAuthorize("isAuthenticated()")
    public List<DepartmentStatDTO> getDepartmentStatistics() {
        return analyticsService.getDepartmentStatistics();
    }

    // =========================================================
    // TOP UTILIZED EQUIPMENT
    // =========================================================

    @GetMapping("/top-equipment")
    @PreAuthorize("isAuthenticated()")
    public List<HeatmapDTO> getTopUtilizedEquipment() {
        return analyticsService.getTopUtilizedEquipment();
    }

}