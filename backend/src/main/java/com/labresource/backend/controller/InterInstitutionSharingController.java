package com.labresource.backend.controller;

import com.labresource.backend.dto.InterInstitutionSharingRequest;
import com.labresource.backend.entity.InterInstitutionSharing;
import com.labresource.backend.service.InterInstitutionSharingService;
import org.springframework.web.bind.annotation.*;
import com.labresource.backend.security.CustomUserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/inter-sharing")
@CrossOrigin(origins = "*")
public class InterInstitutionSharingController {

    private final InterInstitutionSharingService sharingService;

    public InterInstitutionSharingController(
            InterInstitutionSharingService sharingService) {

        this.sharingService = sharingService;
    }

    // Get All
    @GetMapping
    public List<InterInstitutionSharing> getAllSharing(
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {

        return sharingService.getAllSharing(userPrincipal);

    }

    // Get By Id
    @GetMapping("/{id}")
    public InterInstitutionSharing getSharingById(
            @PathVariable Long id) {

        return sharingService.getSharingById(id);

    }

    // Create
    @PostMapping
    public InterInstitutionSharing createSharing(
            @RequestBody InterInstitutionSharingRequest request) {

        return sharingService.createSharing(request);

    }

    // Update
    @PutMapping("/{id}")
    public InterInstitutionSharing updateSharing(
            @PathVariable Long id,
            @RequestBody InterInstitutionSharingRequest request) {

        return sharingService.updateSharing(id, request);

    }

    // Approve Sharing
    @PutMapping("/{id}/approve")
    public InterInstitutionSharing approveSharing(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {

        return sharingService.approveSharing(id, userPrincipal);
    }

    // Reject Sharing
    @PutMapping("/{id}/reject")
    public InterInstitutionSharing rejectSharing(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal) {

        return sharingService.rejectSharing(id, userPrincipal);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteSharing(
            @PathVariable Long id) {

        sharingService.deleteSharing(id);

    }

}