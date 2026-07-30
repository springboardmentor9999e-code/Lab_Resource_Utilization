package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.EquipmentSharing;
import com.labhub.enums.EquipmentSharingStatus;
import com.labhub.service.EquipmentSharingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment-sharing")
@RequiredArgsConstructor
public class EquipmentSharingController {

    private final EquipmentSharingService equipmentSharingService;

    @GetMapping("/shared-equipment")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSharedEquipment(Authentication auth) {
        List<EquipmentSharing> list = equipmentSharingService.getSharedEquipmentList(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @GetMapping("/incoming")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIncoming(Authentication auth) {
        List<EquipmentSharing> list = equipmentSharingService.getIncomingRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @GetMapping("/outgoing")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOutgoing(Authentication auth) {
        List<EquipmentSharing> list = equipmentSharingService.getOutgoingRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'LAB_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestSharing(
            @RequestBody Map<String, String> body, Authentication auth) {
        UUID equipmentId = UUID.fromString(body.get("equipmentId"));
        UUID targetInstId = UUID.fromString(body.get("requestingInstitutionId"));
        String notes = body.get("notes");
        EquipmentSharing s = equipmentSharingService.requestEquipmentSharing(auth.getName(), equipmentId, targetInstId, notes);
        return ResponseEntity.ok(ApiResponse.success("Equipment sharing request created", mapSingle(s)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        EquipmentSharingStatus status = EquipmentSharingStatus.valueOf(body.get("status").toUpperCase());
        EquipmentSharing s = equipmentSharingService.updateSharingStatus(id, status, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Equipment sharing status updated to " + status.name(), mapSingle(s)));
    }

    private List<Map<String, Object>> mapList(List<EquipmentSharing> list) {
        return list.stream().map(this::mapSingle).toList();
    }

    private Map<String, Object> mapSingle(EquipmentSharing s) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", s.getId().toString());
        map.put("equipmentId", s.getEquipment().getId().toString());
        map.put("equipmentName", s.getEquipment().getName());
        map.put("equipmentModel", s.getEquipment().getModel() != null ? s.getEquipment().getModel() : "");
        map.put("owningInstitutionId", s.getOwningInstitution().getId().toString());
        map.put("owningInstitutionName", s.getOwningInstitution().getName());
        map.put("requestingInstitutionId", s.getRequestingInstitution().getId().toString());
        map.put("requestingInstitutionName", s.getRequestingInstitution().getName());
        map.put("status", s.getStatus().name());
        map.put("notes", s.getNotes() != null ? s.getNotes() : "");
        map.put("createdAt", s.getCreatedAt().toString());
        return map;
    }
}
