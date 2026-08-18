package com.lab.backend.controller;

import com.lab.backend.dto.MaintenanceRequest;
import com.lab.backend.dto.MaintenanceResponse;
import com.lab.backend.entity.MaintenanceStatus;
import com.lab.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/maintenance", "/api/maintenances"})
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Add Maintenance
    @PostMapping
    public ResponseEntity<MaintenanceResponse> addMaintenance(
            @RequestBody MaintenanceRequest request) {

        return ResponseEntity.ok(
                maintenanceService.addMaintenance(request)
        );
    }

    // Update Maintenance
    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> updateMaintenance(
            @PathVariable Long id,
            @RequestBody MaintenanceRequest request) {

        return ResponseEntity.ok(
                maintenanceService.updateMaintenance(id, request)
        );
    }

    // Delete Maintenance
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMaintenance(
            @PathVariable Long id) {

        maintenanceService.deleteMaintenance(id);

        return ResponseEntity.ok("Maintenance deleted successfully.");
    }

    // Get All Maintenance
    @GetMapping
    public ResponseEntity<List<MaintenanceResponse>> getAllMaintenance() {

        return ResponseEntity.ok(
                maintenanceService.getAllMaintenance()
        );
    }

    // Get Maintenance by ID
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponse> getMaintenanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceById(id)
        );
    }

    // Update Maintenance Status
    @PutMapping("/{id}/status")
    public ResponseEntity<MaintenanceResponse> updateMaintenanceStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {

        return ResponseEntity.ok(
                maintenanceService.updateStatus(id, status)
        );
    }
}