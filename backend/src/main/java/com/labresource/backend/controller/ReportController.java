package com.labresource.backend.controller;

import com.labresource.backend.service.ReportService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // Dashboard Summary
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTE_ADMIN','LAB_ASSISTANT','DEPARTMENT_HEAD')")
    @GetMapping("/summary")
        public Map<String, Long> getSummary(Authentication authentication) {
        return reportService.getSummary(authentication);
    }
    
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTE_ADMIN','LAB_ASSISTANT','DEPARTMENT_HEAD')")
    @GetMapping("/equipment-utilization")
    public ResponseEntity<List<Map<String,Object>>> equipmentUtilization() {

        return ResponseEntity.ok(
                reportService.getEquipmentUtilizationReport()
        );

    }
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTE_ADMIN')")
    @GetMapping("/procurement-cost")
    public Map<String, Double> getProcurementCostAnalysis() {
        return reportService.getProcurementCostAnalysis();
    }

    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTE_ADMIN')")
    @GetMapping("/institution-sharing")
    public ResponseEntity<?> getInstitutionSharingReport() {
        return ResponseEntity.ok(reportService.getInstitutionSharingReport());
    }
}