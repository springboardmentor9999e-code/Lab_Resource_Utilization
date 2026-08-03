package com.labresource.controller;

import com.labresource.dto.MaintenanceRequest;
import com.labresource.dto.MaintenanceStatusUpdate;
import com.labresource.entity.*;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.MaintenanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceRepository maintenanceRepository;
    private final EquipmentRepository equipmentRepository;

    public MaintenanceController(MaintenanceRepository maintenanceRepository, EquipmentRepository equipmentRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // Only LAB_MANAGER can schedule maintenance/calibration
    @PostMapping
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<MaintenanceRecord> scheduleMaintenance(@RequestBody MaintenanceRequest request) {

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        MaintenanceRecord record = MaintenanceRecord.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .type(request.getType())
                .description(request.getDescription())
                .scheduledDate(request.getScheduledDate())
                .assignedTechnician(request.getAssignedTechnician())
                .status(MaintenanceStatus.SCHEDULED)
                .build();

        // Mark equipment as under maintenance immediately
        equipment.setStatus("UNDER_MAINTENANCE");
        equipmentRepository.save(equipment);

        return ResponseEntity.ok(maintenanceRepository.save(record));
    }

    // Anyone logged in can view maintenance history
    @GetMapping
    public ResponseEntity<List<MaintenanceRecord>> getAllMaintenance() {
        return ResponseEntity.ok(maintenanceRepository.findAll());
    }

    // LAB_TECHNICIAN or LAB_MANAGER can update status (e.g. start work, mark completed)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN', 'LAB_MANAGER')")
    public ResponseEntity<MaintenanceRecord> updateStatus(
            @PathVariable Long id,
            @RequestBody MaintenanceStatusUpdate update) {

        MaintenanceRecord record = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found"));

        record.setStatus(update.getStatus());
        if (update.getNotes() != null) {
            record.setNotes(update.getNotes());
        }

        if (update.getStatus() == MaintenanceStatus.COMPLETED) {
            record.setCompletedDate(LocalDate.now());

            // Restore equipment to AVAILABLE once maintenance is done
            Equipment equipment = equipmentRepository.findById(record.getEquipmentId())
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));
            equipment.setStatus("AVAILABLE");
            equipmentRepository.save(equipment);
        }

        return ResponseEntity.ok(maintenanceRepository.save(record));
    }
}