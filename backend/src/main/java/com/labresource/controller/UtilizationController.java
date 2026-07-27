package com.labresource.controller;

import com.labresource.dto.response.DemandAnalysisResponse;
import com.labresource.dto.response.EquipmentUtilizationResponse;
import com.labresource.dto.response.HeatmapCellResponse;
import com.labresource.dto.response.ApiResponse;
import com.labresource.dto.response.IdleEquipmentResponse;
import com.labresource.dto.response.PeakUsageResponse;
import com.labresource.dto.response.UtilizationSummaryResponse;
import com.labresource.service.impl.IdleEquipmentAlertJob;
import com.labresource.service.interfaces.UtilizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Utilization Monitoring REST API.
 * View-only analytics — open to all authenticated users.
 */
@RestController
@RequestMapping("/api/utilization")
@RequiredArgsConstructor
public class UtilizationController {

    private final UtilizationService utilizationService;
    private final IdleEquipmentAlertJob idleEquipmentAlertJob;

    @GetMapping("/equipment/{id}")
    public ResponseEntity<EquipmentUtilizationResponse> getEquipmentUtilization(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(utilizationService.getEquipmentUtilization(id, days));
    }

    @GetMapping("/summary")
    public ResponseEntity<UtilizationSummaryResponse> getSummary(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(utilizationService.getSummary(days));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<List<HeatmapCellResponse>> getHeatmap(
            @RequestParam(defaultValue = "42") int days,
            @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(utilizationService.getHeatmap(days, equipmentId));
    }

    @GetMapping("/idle")
    public ResponseEntity<List<IdleEquipmentResponse>> getIdleEquipment(
            @RequestParam(defaultValue = "14") int idleDays) {
        return ResponseEntity.ok(utilizationService.getIdleEquipment(idleDays));
    }

    /** Peak usage pattern analysis — busiest/quietest slots and how bunched demand is. */
    @GetMapping("/peak")
    public ResponseEntity<PeakUsageResponse> getPeakUsage(
            @RequestParam(defaultValue = "42") int days,
            @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(utilizationService.getPeakUsage(days, equipmentId));
    }

    /**
     * Demand analysis — requested versus available capacity, and what had to be turned away.
     * Reads the waitlist and rejected bookings, which utilization deliberately ignores.
     */
    @GetMapping("/demand")
    public ResponseEntity<DemandAnalysisResponse> getDemandAnalysis(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(utilizationService.getDemandAnalysis(days));
    }

    // ------------------------------------------------------------------
    // Utilization targets — the yardstick department/institution rates are judged against
    // ------------------------------------------------------------------

    @PutMapping("/targets/department/{departmentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN','DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<Double>> setDepartmentTarget(
            @PathVariable Long departmentId,
            @RequestParam(required = false) Double targetPercent) {
        Double applied = utilizationService.setDepartmentTarget(departmentId, targetPercent);
        return ResponseEntity.ok(new ApiResponse<>(true,
                applied == null
                        ? "Department target cleared — it now inherits the institution target"
                        : "Department target set to " + applied + "%",
                applied));
    }

    @PutMapping("/targets/institution/{institutionId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<Double>> setInstitutionTarget(
            @PathVariable Long institutionId,
            @RequestParam(required = false) Double targetPercent) {
        Double applied = utilizationService.setInstitutionTarget(institutionId, targetPercent);
        return ResponseEntity.ok(new ApiResponse<>(true,
                applied == null
                        ? "Institution target cleared — departments now fall back to the platform default"
                        : "Institution target set to " + applied + "%",
                applied));
    }

    /**
     * On-demand idle alert fan-out to managers (same logic as the daily 07:45 job,
     * with a 7-day per-equipment dedup window). Returns how many alerts were sent.
     */
    @PostMapping("/idle/alert")
    @org.springframework.security.access.prepost.PreAuthorize(
            "hasAnyRole('SYSTEM_ADMIN','LAB_MANAGER','DEPARTMENT_HEAD')")
    public ResponseEntity<Map<String, Object>> triggerIdleAlerts(
            @RequestParam(defaultValue = "14") int idleDays) {
        int sent = idleEquipmentAlertJob.alertIdleEquipment(idleDays);
        return ResponseEntity.ok(Map.of(
                "alertsSent", sent,
                "message", sent == 0
                        ? "No new alerts — managers were already notified for all idle equipment this week"
                        : sent + " alert(s) sent to lab managers"));
    }
}
