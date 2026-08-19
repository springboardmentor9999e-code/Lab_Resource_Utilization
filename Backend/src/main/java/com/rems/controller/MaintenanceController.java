package com.rems.controller;

import com.rems.dto.MaintenanceDTO;
import com.rems.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping("/put")
    @PreAuthorize("hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance_requests') or hasAuthority('manage_maintenance') or hasAuthority('manage_equipment')")
    public ResponseEntity<?> putInMaintenance(
            @RequestBody MaintenanceDTO.Request request,
            Principal principal) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(maintenanceService.putInMaintenance(request, principal != null ? principal.getName() : null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getClass().getSimpleName(), "message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/{recordId}/make-available")
    @PreAuthorize("hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance_requests') or hasAuthority('manage_maintenance') or hasAuthority('manage_equipment') or isAuthenticated()")
    public ResponseEntity<?> makeAvailable(
            @PathVariable Long recordId,
            Principal principal) {
        try {
            return ResponseEntity.ok(maintenanceService.makeAvailable(recordId, principal != null ? principal.getName() : null));
        } catch (com.rems.exception.ApiException e) {
            return ResponseEntity.status(e.getStatus())
                    .body(java.util.Map.of("message", e.getMessage(), "error", e.getStatus().getReasonPhrase()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", e.getClass().getSimpleName(), "message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{recordId}/start-time")
    @PreAuthorize("hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance_requests') or hasAuthority('manage_maintenance') or hasAuthority('manage_equipment')")
    public ResponseEntity<?> updateStartTime(
            @PathVariable Long recordId,
            @RequestBody MaintenanceDTO.UpdateTimeRequest request) {
        try {
            return ResponseEntity.ok(maintenanceService.updateStartTime(recordId, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getClass().getSimpleName(), "message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('view_equipment') or hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance')")
    public ResponseEntity<?> getMaintenanceRecords(Principal principal) {
        try {
            return ResponseEntity.ok(maintenanceService.getMaintenanceRecords(principal != null ? principal.getName() : null));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getClass().getSimpleName(), "message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
