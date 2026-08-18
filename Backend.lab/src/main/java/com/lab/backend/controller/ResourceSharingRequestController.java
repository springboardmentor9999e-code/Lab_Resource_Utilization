package com.lab.backend.controller;

import com.lab.backend.dto.ResourceSharingRequestDTO;
import com.lab.backend.entity.ResourceSharingRequest;
import com.lab.backend.enums.SharingStatus;
import com.lab.backend.service.ResourceSharingRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing-requests")
@CrossOrigin(origins = "*")
public class ResourceSharingRequestController {

    private final ResourceSharingRequestService resourceSharingRequestService;

    public ResourceSharingRequestController(ResourceSharingRequestService resourceSharingRequestService) {
        this.resourceSharingRequestService = resourceSharingRequestService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> createRequest(@RequestBody ResourceSharingRequestDTO dto) {
        return ResponseEntity.ok(resourceSharingRequestService.createRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<ResourceSharingRequest>> getAllRequests(@RequestParam(required = false) SharingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(resourceSharingRequestService.getRequestsByStatus(status));
        }
        return ResponseEntity.ok(resourceSharingRequestService.getAllRequests());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<List<ResourceSharingRequest>> getPendingRequests() {
        return ResponseEntity.ok(resourceSharingRequestService.getPendingRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceSharingRequest> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingRequestService.getRequestById(id));
    }

    @GetMapping("/requesting-lab/{labId}")
    public ResponseEntity<List<ResourceSharingRequest>> getRequestsByRequestingLab(@PathVariable Long labId) {
        return ResponseEntity.ok(resourceSharingRequestService.getRequestsByRequestingLab(labId));
    }

    @GetMapping("/provider-lab/{labId}")
    public ResponseEntity<List<ResourceSharingRequest>> getRequestsByProviderLab(@PathVariable Long labId) {
        return ResponseEntity.ok(resourceSharingRequestService.getRequestsByProviderLab(labId));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingRequestService.approveRequest(id));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> activateRequest(@PathVariable Long id) {
        return ResponseEntity.ok(resourceSharingRequestService.activateRequest(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> rejectRequest(@PathVariable Long id, @RequestParam(required = false, defaultValue = "") String reason) {
        return ResponseEntity.ok(resourceSharingRequestService.rejectRequest(id, reason));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        resourceSharingRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }
}
