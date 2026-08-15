package com.labresource.backend.controller;

import com.labresource.backend.dto.EquipmentUtilizationResponse;
import com.labresource.backend.dto.UtilizationResponse;
import com.labresource.backend.service.UtilizationService;
import org.springframework.web.bind.annotation.*;
import com.labresource.backend.dto.InstitutionUtilizationResponse;
import java.util.List;
import com.labresource.backend.dto.UtilizationTrendResponse;
import com.labresource.backend.dto.PeakUsageResponse;
import com.labresource.backend.dto.DepartmentUtilizationResponse;
import com.labresource.backend.dto.UtilizationHeatmapResponse;
import com.labresource.backend.dto.IdleEquipmentResponse;

@RestController
@RequestMapping("/api/utilization")
@CrossOrigin(origins = "*")
public class UtilizationController {

    private final UtilizationService utilizationService;

    public UtilizationController(UtilizationService utilizationService) {
        this.utilizationService = utilizationService;
    }

    @GetMapping("/summary")
    public UtilizationResponse getSummary() {
        return utilizationService.getUtilizationSummary();
    }

    @GetMapping("/equipment")
    public List<EquipmentUtilizationResponse> getEquipmentUtilization() {
        return utilizationService.getEquipmentUtilization();
    }

    @GetMapping("/institutions")
    public List<InstitutionUtilizationResponse> getInstitutionUtilization() {
        return utilizationService.getInstitutionUtilization();
    }

    @GetMapping("/departments")
    public List<DepartmentUtilizationResponse> getDepartmentUtilization() {
        return utilizationService.getDepartmentUtilization();
    }

    @GetMapping("/peak-usage")
    public List<PeakUsageResponse> getPeakUsageData() {
        return utilizationService.getPeakUsageData();
    }

    @GetMapping("/trend")
    public List<UtilizationTrendResponse> getUtilizationTrend() {
        return utilizationService.getUtilizationTrend();
    }

    @GetMapping("/idle-equipment")
    public List<IdleEquipmentResponse> getIdleEquipment() {
        return utilizationService.getIdleEquipment();
    }

    @GetMapping("/heatmap")
    public List<UtilizationHeatmapResponse> getHeatmap() {
        return utilizationService.getUtilizationHeatmap();
    }
}