package com.example.backend.controller;

import com.example.backend.dto.DashboardDTO;
import com.example.backend.dto.UtilizationHeatMapDTO;
import com.example.backend.service.DashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public DashboardDTO getDashboardData() {
        return dashboardService.getDashboardData();
    }

    @GetMapping("/heatmap")
    public List<UtilizationHeatMapDTO> getHeatMapData() {
        return dashboardService.getHeatMapData();
    }

}