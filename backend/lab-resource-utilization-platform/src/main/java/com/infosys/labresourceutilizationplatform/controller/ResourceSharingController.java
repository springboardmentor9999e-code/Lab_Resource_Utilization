package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.dto.ResourceSharingRequestDTO;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.ResourceSharing;
import com.infosys.labresourceutilizationplatform.service.ResourceSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceSharingController {

    @Autowired
    private ResourceSharingService resourceSharingService;

    @PostMapping("/request")
    public ResponseEntity<ResourceSharing> createSharingRequest(
            @RequestBody ResourceSharingRequestDTO dto,
            Principal principal) {
        String email = principal != null ? principal.getName() : "student@infosys.com";
        return ResponseEntity.ok(resourceSharingService.createSharingRequest(dto, email));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ResourceSharing> approveSharingRequest(
            @PathVariable Long id,
            Principal principal) {
        String email = principal != null ? principal.getName() : "admin@infosys.com";
        return ResponseEntity.ok(resourceSharingService.approveSharingRequest(id, email));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ResourceSharing> rejectSharingRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            Principal principal) {
        String email = principal != null ? principal.getName() : "admin@infosys.com";
        String reason = payload != null ? payload.get("reason") : "Declined by administrator";
        return ResponseEntity.ok(resourceSharingService.rejectSharingRequest(id, reason, email));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResourceSharing> cancelSharingRequest(
            @PathVariable Long id,
            Principal principal) {
        String email = principal != null ? principal.getName() : "student@infosys.com";
        return ResponseEntity.ok(resourceSharingService.cancelSharingRequest(id, email));
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<ResourceSharing>> getIncomingRequests(Principal principal) {
        String email = principal != null ? principal.getName() : "admin@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getIncomingRequests(email));
    }

    @GetMapping("/outgoing")
    public ResponseEntity<List<ResourceSharing>> getOutgoingRequests(Principal principal) {
        String email = principal != null ? principal.getName() : "student@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getOutgoingRequests(email));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<ResourceSharing>> getMyRequests(Principal principal) {
        String email = principal != null ? principal.getName() : "student@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getMyRequests(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<ResourceSharing>> getAllRequests(Principal principal) {
        String email = principal != null ? principal.getName() : "admin@system.com";
        return ResponseEntity.ok(resourceSharingService.getAllRequests(email));
    }

    @GetMapping("/available-equipment")
    public ResponseEntity<List<Equipment>> getAvailableEquipment(
            @RequestParam(required = false) Long targetInstitutionId,
            Principal principal) {
        String email = principal != null ? principal.getName() : "student@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getAvailableEquipmentForSharing(email, targetInstitutionId));
    }

    @GetMapping("/active-shared-to-institute/{institutionId}")
    public ResponseEntity<List<Equipment>> getActiveSharedEquipmentForInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(resourceSharingService.getActiveSharedEquipmentForInstitution(institutionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceSharing> getSharingRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingService.getSharingRequestById(id));
    }

    @GetMapping("/analytics")
    public ResponseEntity<com.infosys.labresourceutilizationplatform.dto.ResourceSharingAnalyticsDTO> getSharingAnalytics(
            @RequestParam(defaultValue = "month") String timeframe,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate endDate,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) Long equipmentId,
            Principal principal) {
        String email = principal != null ? principal.getName() : "admin@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getSharingAnalytics(
                timeframe, startDate, endDate, institutionId, departmentId, laboratoryId, equipmentId, email));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSharingStats(Principal principal) {
        String email = principal != null ? principal.getName() : "admin@infosys.com";
        return ResponseEntity.ok(resourceSharingService.getSharingStats(email));
    }
}
