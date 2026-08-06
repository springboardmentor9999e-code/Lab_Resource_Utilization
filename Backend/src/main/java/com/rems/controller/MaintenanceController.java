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
    public ResponseEntity<MaintenanceDTO.Response> putInMaintenance(
            @RequestBody MaintenanceDTO.Request request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceService.putInMaintenance(request, principal != null ? principal.getName() : null));
    }

    @PostMapping("/{recordId}/make-available")
    @PreAuthorize("hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance_requests') or hasAuthority('manage_maintenance') or hasAuthority('manage_equipment')")
    public ResponseEntity<MaintenanceDTO.Response> makeAvailable(
            @PathVariable Long recordId,
            Principal principal) {
        return ResponseEntity.ok(maintenanceService.makeAvailable(recordId, principal != null ? principal.getName() : null));
    }

    @PutMapping("/{recordId}/start-time")
    @PreAuthorize("hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance_requests') or hasAuthority('manage_maintenance') or hasAuthority('manage_equipment')")
    public ResponseEntity<MaintenanceDTO.Response> updateStartTime(
            @PathVariable Long recordId,
            @RequestBody MaintenanceDTO.UpdateTimeRequest request) {
        return ResponseEntity.ok(maintenanceService.updateStartTime(recordId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('view_equipment') or hasAuthority('update_equipment_status') or hasAuthority('manage_maintenance')")
    public ResponseEntity<List<MaintenanceDTO.Response>> getMaintenanceRecords(Principal principal) {
        return ResponseEntity.ok(maintenanceService.getMaintenanceRecords(principal != null ? principal.getName() : null));
    }
}
