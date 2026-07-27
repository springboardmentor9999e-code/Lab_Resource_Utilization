package com.labresource.controller;

import com.labresource.dto.request.CalibrationCreate;
import com.labresource.dto.request.MaintenanceRequestCreate;
import com.labresource.dto.request.MaintenanceScheduleCreate;
import com.labresource.dto.response.CalibrationResponse;
import com.labresource.dto.response.MaintenanceRequestResponse;
import com.labresource.dto.response.MaintenanceScheduleResponse;
import com.labresource.service.interfaces.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private static final String MANAGERS =
            "hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER')";
    private static final String STAFF =
            "hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER', 'LAB_TECHNICIAN')";

    private final MaintenanceService maintenanceService;

    // ----- Work orders -----

    @PostMapping("/requests")
    public ResponseEntity<MaintenanceRequestResponse> createRequest(
            @Valid @RequestBody MaintenanceRequestCreate request, Principal principal) {
        return new ResponseEntity<>(
                maintenanceService.createRequest(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<MaintenanceRequestResponse>> getRequests(Principal principal) {
        return ResponseEntity.ok(maintenanceService.getRequests(principal.getName()));
    }

    @GetMapping("/requests/my-assigned")
    public ResponseEntity<List<MaintenanceRequestResponse>> getMyAssigned(Principal principal) {
        return ResponseEntity.ok(maintenanceService.getMyAssigned(principal.getName()));
    }

    @PatchMapping("/requests/{id}/assign")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<MaintenanceRequestResponse> assign(
            @PathVariable Long id, @RequestParam Long technicianId, Principal principal) {
        return ResponseEntity.ok(maintenanceService.assign(id, technicianId, principal.getName()));
    }

    /** Role/ownership checks are enforced inside the service. */
    @PatchMapping("/requests/{id}/status")
    public ResponseEntity<MaintenanceRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String resolutionNotes,
            @RequestParam(required = false) BigDecimal cost,
            Principal principal) {
        return ResponseEntity.ok(
                maintenanceService.updateStatus(id, status, resolutionNotes, cost, principal.getName()));
    }

    @GetMapping("/technicians")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<List<Map<String, Object>>> getTechnicians() {
        return ResponseEntity.ok(maintenanceService.getTechnicians());
    }

    // ----- Calibration & certification -----

    @PostMapping("/calibrations")
    @PreAuthorize(STAFF)
    public ResponseEntity<CalibrationResponse> addCalibration(
            @Valid @RequestBody CalibrationCreate request, Principal principal) {
        return new ResponseEntity<>(
                maintenanceService.addCalibration(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/calibrations")
    public ResponseEntity<List<CalibrationResponse>> getCalibrations(
            @RequestParam(required = false) Long equipmentId) {
        return ResponseEntity.ok(maintenanceService.getCalibrations(equipmentId));
    }

    @GetMapping("/calibrations/expiring")
    public ResponseEntity<List<CalibrationResponse>> getExpiring(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(maintenanceService.getExpiringCalibrations(days));
    }

    // ----- Preventive schedules -----

    @PostMapping("/schedules")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<MaintenanceScheduleResponse> createSchedule(
            @Valid @RequestBody MaintenanceScheduleCreate request, Principal principal) {
        return new ResponseEntity<>(
                maintenanceService.createSchedule(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/schedules")
    @PreAuthorize(STAFF)
    public ResponseEntity<List<MaintenanceScheduleResponse>> getSchedules() {
        return ResponseEntity.ok(maintenanceService.getSchedules());
    }

    @PatchMapping("/schedules/{id}/toggle")
    @PreAuthorize(MANAGERS)
    public ResponseEntity<MaintenanceScheduleResponse> toggleSchedule(
            @PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(maintenanceService.toggleSchedule(id, principal.getName()));
    }

    // ----- Summary -----

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(maintenanceService.getSummary());
    }
}
