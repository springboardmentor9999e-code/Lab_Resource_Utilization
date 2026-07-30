package com.rems.controller;

import com.rems.service.MetricsService;
import com.rems.service.RollupJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MetricsController {

    private final MetricsService metricsService;
    private final RollupJobService rollupJobService;

    @GetMapping("/utilization/equipment/{id}")
    @PreAuthorize("hasAuthority('view_equipment')")
    public ResponseEntity<List<MetricsService.DailyUtilization>> getEquipmentUtilization(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(metricsService.getEquipmentUtilization(id, range));
    }

    @GetMapping("/utilization/department/{id}")
    @PreAuthorize("hasAuthority('view_department_utilization') or hasAuthority('view_department_reports')")
    public ResponseEntity<MetricsService.HeatmapData> getDepartmentUtilization(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(metricsService.getDepartmentUtilizationHeatmap(id, range));
    }

    @GetMapping("/demand/equipment/{id}")
    @PreAuthorize("hasAuthority('view_equipment')")
    public ResponseEntity<MetricsService.DemandMetricResponse> getEquipmentDemand(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(metricsService.getEquipmentDemand(id, range));
    }

    @GetMapping("/demand/ranking")
    @PreAuthorize("hasAuthority('view_institution_reports') or hasAuthority('view_department_reports') or hasAuthority('view_equipment')")
    public ResponseEntity<List<MetricsService.DemandMetricResponse>> getDemandRanking(
            @RequestParam String scope,
            @RequestParam(required = false) Long scopeId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(metricsService.getDemandRanking(scope, scopeId, categoryId, range));
    }

    @GetMapping("/insights/quadrant")
    @PreAuthorize("hasAuthority('view_department_utilization') or hasAuthority('view_department_reports') or hasAuthority('view_equipment')")
    public ResponseEntity<List<MetricsService.QuadrantPoint>> getQuadrantData(
            @RequestParam Long departmentId) {
        return ResponseEntity.ok(metricsService.getQuadrantData(departmentId));
    }

    @PostMapping("/admin/metrics/trigger-batch")
    @PreAuthorize("hasAuthority('manage_system_settings') or hasAuthority('manage_equipment') or hasAuthority('approve_bookings')")
    public ResponseEntity<Map<String, String>> triggerBatch(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        rollupJobService.backfillPipeline(start, end);
        return ResponseEntity.ok(Map.of("message", "Batch rollup executed successfully from " + start + " to " + end));
    }
}
