package com.lab.backend.controller;

import com.lab.backend.dto.SharingAgreementDTO;
import com.lab.backend.entity.SharingAgreement;
import com.lab.backend.enums.SharingStatus;
import com.lab.backend.service.SharingAgreementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing-agreements")
@CrossOrigin(origins = "*")
public class SharingAgreementController {

    private final SharingAgreementService sharingAgreementService;

    public SharingAgreementController(SharingAgreementService sharingAgreementService) {
        this.sharingAgreementService = sharingAgreementService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<SharingAgreement> createAgreement(@RequestBody SharingAgreementDTO dto) {
        return ResponseEntity.ok(sharingAgreementService.createAgreement(dto));
    }

    @GetMapping
    public ResponseEntity<List<SharingAgreement>> getAllAgreements(@RequestParam(required = false) SharingStatus status) {
        if (status != null) {
            return ResponseEntity.ok(sharingAgreementService.getAgreementsByStatus(status));
        }
        return ResponseEntity.ok(sharingAgreementService.getAllAgreements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SharingAgreement> getAgreementById(@PathVariable Long id) {
        return ResponseEntity.ok(sharingAgreementService.getAgreementById(id));
    }

    @GetMapping("/laboratory/{labId}")
    public ResponseEntity<List<SharingAgreement>> getAgreementsByLabId(@PathVariable Long labId) {
        return ResponseEntity.ok(sharingAgreementService.getAgreementsByLabId(labId));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<SharingAgreement> approveAgreement(@PathVariable Long id) {
        return ResponseEntity.ok(sharingAgreementService.approveAgreement(id));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<SharingAgreement> activateAgreement(@PathVariable Long id) {
        return ResponseEntity.ok(sharingAgreementService.activateAgreement(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<SharingAgreement> rejectAgreement(@PathVariable Long id) {
        return ResponseEntity.ok(sharingAgreementService.rejectAgreement(id));
    }

    @PutMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<SharingAgreement> terminateAgreement(@PathVariable Long id) {
        return ResponseEntity.ok(sharingAgreementService.terminateAgreement(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMINISTRATOR', 'MANAGER')")
    public ResponseEntity<Void> deleteAgreement(@PathVariable Long id) {
        sharingAgreementService.deleteAgreement(id);
        return ResponseEntity.noContent().build();
    }
}
