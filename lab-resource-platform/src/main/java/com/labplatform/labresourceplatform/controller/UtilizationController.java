package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.UtilizationLog;
import com.labplatform.labresourceplatform.service.UtilizationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilization")
public class UtilizationController {

    private final UtilizationService utilizationService;

    public UtilizationController(UtilizationService utilizationService) {
        this.utilizationService = utilizationService;
    }

    // Manually log a usage session (e.g. from IoT sensor integration or manual technician entry).
    @PostMapping("/logs")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public UtilizationLog logUsage(@RequestBody UtilizationLog log) {
        return utilizationService.logUsage(log);
    }

    // Utilization rate for one piece of equipment over a time window.
    @GetMapping("/equipment/{id}/rate")
    public Map<String, Object> getUtilizationRate(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return utilizationService.getUtilizationRate(id, from, to);
    }

    // Utilization heatmap across all equipment - feeds the Lab Manager / Dept Head dashboard.
    @GetMapping("/heatmap")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'LAB_TECHNICIAN')")
    public List<Map<String, Object>> getUtilizationHeatmap(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return utilizationService.getUtilizationHeatmap(from, to);
    }

    // Idle equipment alerts - equipment unused beyond the idle threshold.
    @GetMapping("/idle")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'DEPARTMENT_HEAD')")
    public List<Map<String, Object>> getIdleEquipment() {
        return utilizationService.getIdleEquipment();
    }

    // "Which day is used most" - platform-wide, across all equipment.
    @GetMapping("/patterns/day-of-week")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'LAB_TECHNICIAN')")
    public Map<DayOfWeek, Long> getUsageByDayOfWeek() {
        return utilizationService.getUsageByDayOfWeek();
    }

    // "Pattern of particular equipment usage" - per-equipment breakdown
    // (busiest day, most common start hour, average session length).
    @GetMapping("/equipment/{id}/pattern")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'LAB_TECHNICIAN')")
    public Map<String, Object> getUsagePatternForEquipment(@PathVariable Long id) {
        return utilizationService.getUsagePatternForEquipment(id);
    }
}
