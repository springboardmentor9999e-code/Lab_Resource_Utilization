package com.lab.backend.controller;

import com.lab.backend.dto.DashboardDTO;
import com.lab.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Existing dashboard statistics
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    // Utilization dashboard DTO
    @GetMapping("/utilization")
    public ResponseEntity<DashboardDTO> getUtilizationDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    // Main Dashboard response (Step 2 requirement)
    @GetMapping
    public ResponseEntity<com.lab.backend.dto.DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboardResponse());
    }

    // Complete DashboardResponse DTO (Step 2 requirement)
    @GetMapping("/response")
    public ResponseEntity<com.lab.backend.dto.DashboardResponse> getDashboardResponse() {
        return ResponseEntity.ok(dashboardService.getDashboardResponse());
    }
}