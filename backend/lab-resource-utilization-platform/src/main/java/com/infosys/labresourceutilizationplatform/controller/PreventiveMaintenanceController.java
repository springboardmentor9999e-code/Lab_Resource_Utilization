package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.PreventiveMaintenance;
import com.infosys.labresourceutilizationplatform.service.PreventiveMaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preventive")
@CrossOrigin(origins = "http://localhost:3000")
public class PreventiveMaintenanceController {

    @Autowired
    private PreventiveMaintenanceService preventiveMaintenanceService;

    @PostMapping
    public ResponseEntity<?> scheduleMaintenance(@RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            Long equipmentId = Long.valueOf(payload.get("equipmentId").toString());
            String scheduledDate = payload.get("scheduledDate").toString();
            String description = payload.get("description").toString();

            PreventiveMaintenance pm = preventiveMaintenanceService.scheduleMaintenance(equipmentId, scheduledDate, description);
            return ResponseEntity.ok(pm);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllSchedules(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            List<PreventiveMaintenance> schedules = preventiveMaintenanceService.getAllSchedules();
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMaintenanceStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            String status = payload.get("status").toString();
            String remarks = payload.containsKey("remarks") && payload.get("remarks") != null ? payload.get("remarks").toString() : "";

            PreventiveMaintenance pm = preventiveMaintenanceService.updateMaintenanceStatus(id, status, remarks);
            return ResponseEntity.ok(pm);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
