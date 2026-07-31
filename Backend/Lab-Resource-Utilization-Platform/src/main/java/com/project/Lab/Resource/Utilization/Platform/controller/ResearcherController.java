package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.DashboardStatsDTO;
import com.project.Lab.Resource.Utilization.Platform.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/researcher")
@CrossOrigin("*")
public class ResearcherController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('RESEARCHER')")
    public DashboardStatsDTO dashboard() {

        return analyticsService.getDashboardStats("RESEARCHER");

    }

    @GetMapping("/test")
    @PreAuthorize("hasRole('RESEARCHER')")
    public String test() {

        return "RESEARCHER Access Granted";

    }

}