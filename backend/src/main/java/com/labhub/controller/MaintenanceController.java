package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.Maintenance;
import com.labhub.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll(Authentication auth) {
        List<Maintenance> list = maintenanceService.getAllMaintenance(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(list.stream().map(this::mapSingle).toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(
            @RequestBody Map<String, Object> body, Authentication auth) {
        UUID equipmentId = UUID.fromString((String) body.get("equipmentId"));
        String type = (String) body.get("type");
        String description = (String) body.get("description");
        LocalDate scheduledDate = body.get("scheduledDate") != null ? LocalDate.parse((String) body.get("scheduledDate")) : null;
        Double cost = body.get("cost") != null ? Double.parseDouble(body.get("cost").toString()) : 0.0;
        LocalDate startDate = body.get("startDate") != null ? LocalDate.parse((String) body.get("startDate")) : LocalDate.now();
        UUID technicianId = body.get("technicianId") != null && !((String) body.get("technicianId")).isBlank()
                ? UUID.fromString((String) body.get("technicianId")) : null;

        Maintenance m = maintenanceService.createRequest(auth.getName(), equipmentId, type, description, scheduledDate, cost, startDate, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Maintenance request created successfully", mapSingle(m)));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approve(@PathVariable UUID id, Authentication auth) {
        Maintenance m = maintenanceService.approveRequest(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Maintenance request approved", mapSingle(m)));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reject(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        String reason = body.getOrDefault("reason", "Not approved");
        Maintenance m = maintenanceService.rejectRequest(id, reason, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Maintenance request rejected", mapSingle(m)));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> complete(
            @PathVariable UUID id, @RequestBody(required = false) Map<String, String> body, Authentication auth) {
        String notes = body != null ? body.get("notes") : "Completed";
        Maintenance m = maintenanceService.completeMaintenance(id, notes, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Maintenance marked as completed", mapSingle(m)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, Object> body, Authentication auth) {
        String statusStr = (String) body.get("status");
        String notes = (String) body.get("notes");
        com.labhub.enums.MaintenanceStatus status = statusStr != null ? com.labhub.enums.MaintenanceStatus.valueOf(statusStr) : null;
        Maintenance m = maintenanceService.updateStatus(id, status, notes, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Maintenance status updated", mapSingle(m)));
    }

    private Map<String, Object> mapSingle(Maintenance m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", m.getId().toString());
        map.put("equipmentId", m.getEquipment().getId().toString());
        map.put("equipmentName", m.getEquipment().getName());
        map.put("type", m.getType() != null ? m.getType() : "");
        map.put("description", m.getDescription() != null ? m.getDescription() : "");
        map.put("scheduledDate", m.getScheduledDate() != null ? m.getScheduledDate().toString() : "");
        map.put("completedDate", m.getCompletedDate() != null ? m.getCompletedDate().toString() : "");
        map.put("startDate", m.getStartDate() != null ? m.getStartDate().toString() : "");
        map.put("status", m.getStatus().name());
        map.put("cost", m.getCost() != null ? m.getCost() : 0.0);
        map.put("notes", m.getNotes() != null ? m.getNotes() : "");
        return map;
    }
}
