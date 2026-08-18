package com.lab.backend.controller;

import com.lab.backend.entity.ResourceSharingRequest;
import com.lab.backend.dto.ResourceSharingRequestDTO;
import com.lab.backend.service.ResourceSharingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resource-sharing")
@CrossOrigin(origins = "*")
public class ResourceSharingController {
    
    @Autowired
    private ResourceSharingService sharingService;
    
    // Request sharing
    @PostMapping("/request")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STUDENT', 'FACULTY', 'TECHNICIAN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> requestResourceShare(
            @RequestBody ResourceSharingRequestDTO dto) {
        
        ResourceSharingRequest request = sharingService.requestResourceShare(dto);
        return ResponseEntity.ok(request);
    }
    
    // Get pending requests (admin only)
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<List<ResourceSharingRequest>> getPendingRequests() {
        List<ResourceSharingRequest> requests = sharingService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }
    
    // Approve request
    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> approveRequest(
            @PathVariable Long requestId) {
        
        ResourceSharingRequest request = sharingService.approveSharingRequest(requestId);
        return ResponseEntity.ok(request);
    }
    
    // Activate approved request
    @PostMapping("/{requestId}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> activateRequest(
            @PathVariable Long requestId) {
        
        ResourceSharingRequest request = sharingService.activateSharingRequest(requestId);
        return ResponseEntity.ok(request);
    }
    
    // Reject request
    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<ResourceSharingRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String reason) {
        
        ResourceSharingRequest request = sharingService.rejectSharingRequest(requestId, reason);
        return ResponseEntity.ok(request);
    }
}
