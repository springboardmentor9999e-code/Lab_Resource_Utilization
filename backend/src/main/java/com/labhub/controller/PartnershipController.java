package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.Partnership;
import com.labhub.enums.PartnershipStatus;
import com.labhub.service.PartnershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/partnerships")
@RequiredArgsConstructor
public class PartnershipController {

    private final PartnershipService partnershipService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllPartnerships(Authentication auth) {
        List<Partnership> list = partnershipService.getAllPartnerships(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @GetMapping("/incoming")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getIncoming(Authentication auth) {
        List<Partnership> list = partnershipService.getIncomingRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @GetMapping("/outgoing")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOutgoing(Authentication auth) {
        List<Partnership> list = partnershipService.getOutgoingRequests(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(mapList(list)));
    }

    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestPartnership(
            @RequestBody Map<String, String> body, Authentication auth) {
        UUID targetInstId = UUID.fromString(body.get("targetInstitutionId"));
        String notes = body.get("notes");
        Partnership p = partnershipService.requestPartnership(auth.getName(), targetInstId, notes);
        return ResponseEntity.ok(ApiResponse.success("Partnership request sent successfully", mapSingle(p)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'INSTITUTION_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable UUID id, @RequestBody Map<String, String> body, Authentication auth) {
        PartnershipStatus status = PartnershipStatus.valueOf(body.get("status").toUpperCase());
        Partnership p = partnershipService.updatePartnershipStatus(id, status, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Partnership status updated to " + status.name(), mapSingle(p)));
    }

    private List<Map<String, Object>> mapList(List<Partnership> list) {
        return list.stream().map(this::mapSingle).toList();
    }

    private Map<String, Object> mapSingle(Partnership p) {
        return Map.of(
                "id", p.getId().toString(),
                "requesterInstitutionId", p.getRequesterInstitution().getId().toString(),
                "requesterInstitutionName", p.getRequesterInstitution().getName(),
                "targetInstitutionId", p.getTargetInstitution().getId().toString(),
                "targetInstitutionName", p.getTargetInstitution().getName(),
                "status", p.getStatus().name(),
                "notes", p.getNotes() != null ? p.getNotes() : "",
                "createdAt", p.getCreatedAt().toString()
        );
    }
}
