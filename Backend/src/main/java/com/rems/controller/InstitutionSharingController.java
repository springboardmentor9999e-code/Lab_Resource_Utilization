package com.rems.controller;

import com.rems.dto.*;
import com.rems.service.InstitutionSharingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institution-sharing")
@RequiredArgsConstructor
public class InstitutionSharingController {

    private final InstitutionSharingService institutionSharingService;

    // GET /api/institution-sharing/institutions -> Explore Directory of active institutions
    @GetMapping("/institutions")
    @PreAuthorize("hasAuthority('manage_sharing_agreements') or hasRole('ROLE_5')")
    public ResponseEntity<List<InstitutionDirectoryResponse>> getInstitutionsDirectory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(institutionSharingService.getApprovedInstitutionsDirectory(email));
    }

    // GET /api/institution-sharing/agreements -> Fetch agreements (filtered by status=PENDING, APPROVED, ALL)
    @GetMapping("/agreements")
    @PreAuthorize("hasAuthority('manage_sharing_agreements') or hasRole('ROLE_5')")
    public ResponseEntity<List<SharingAgreementResponse>> getAgreements(
            @RequestParam(required = false) String status,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(institutionSharingService.getAgreements(email, status));
    }

    // POST /api/institution-sharing/request -> Initiate resource sharing request
    @PostMapping("/request")
    @PreAuthorize("hasAuthority('manage_sharing_agreements') or hasRole('ROLE_5')")
    public ResponseEntity<SharingAgreementResponse> createRequest(
            @Valid @RequestBody SharingAgreementRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.CREATED).body(institutionSharingService.createRequest(email, request));
    }

    // PATCH /api/institution-sharing/{id}/approve -> Approve reciprocal tie-up
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('manage_sharing_agreements') or hasRole('ROLE_5')")
    public ResponseEntity<SharingAgreementResponse> approveAgreement(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(institutionSharingService.approveAgreement(id, email));
    }

    // PATCH /api/institution-sharing/{id}/reject -> Decline sharing request
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('manage_sharing_agreements') or hasRole('ROLE_5')")
    public ResponseEntity<SharingAgreementResponse> rejectAgreement(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(institutionSharingService.rejectAgreement(id, email));
    }

    // GET /api/institution-sharing/partners/{partnerId}/equipment -> Browse shared equipment of partner institution
    @GetMapping("/partners/{partnerId}/equipment")
    public ResponseEntity<List<EquipmentResponse>> getPartnerEquipment(
            @PathVariable Long partnerId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(institutionSharingService.getPartnerEquipment(partnerId, email));
    }
}
