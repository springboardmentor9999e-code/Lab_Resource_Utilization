package com.labresource.controller;

import com.labresource.dto.SharingRequestCreateDto;
import com.labresource.entity.*;
import com.labresource.repository.EquipmentRepository;
import com.labresource.repository.SharingRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sharing-requests")
public class SharingRequestController {

    private final SharingRequestRepository sharingRequestRepository;
    private final EquipmentRepository equipmentRepository;

    public SharingRequestController(SharingRequestRepository sharingRequestRepository,
                                    EquipmentRepository equipmentRepository) {
        this.sharingRequestRepository = sharingRequestRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // Any logged-in user can request access to another institution's equipment
    @PostMapping
    public ResponseEntity<SharingRequest> createSharingRequest(
            @RequestBody SharingRequestCreateDto dto,
            Authentication authentication) {

        Equipment equipment = equipmentRepository.findById(dto.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (equipment.getInstitutionId() == null) {
            throw new RuntimeException("This equipment is not assigned to an institution and cannot be shared");
        }

        if (equipment.getInstitutionId().equals(dto.getRequestingInstitutionId())) {
            throw new RuntimeException("Cannot request sharing access to equipment your own institution already owns");
        }

        SharingRequest request = SharingRequest.builder()
                .equipmentId(equipment.getId())
                .equipmentName(equipment.getName())
                .ownerInstitutionId(equipment.getInstitutionId())
                .requestingInstitutionId(dto.getRequestingInstitutionId())
                .requestedBy(authentication.getName())
                .reason(dto.getReason())
                .status(SharingRequestStatus.PENDING)
                .build();

        return ResponseEntity.ok(sharingRequestRepository.save(request));
    }

    // Anyone logged in can view all sharing requests
    @GetMapping
    public ResponseEntity<List<SharingRequest>> getAllSharingRequests() {
        return ResponseEntity.ok(sharingRequestRepository.findAll());
    }

    // Only INSTITUTION_ADMINISTRATOR can approve — represents the owning institution granting access
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('INSTITUTION_ADMINISTRATOR')")
    public ResponseEntity<SharingRequest> approveSharingRequest(@PathVariable Long id) {
        SharingRequest request = sharingRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sharing request not found"));

        request.setStatus(SharingRequestStatus.APPROVED);
        return ResponseEntity.ok(sharingRequestRepository.save(request));
    }

    // Only INSTITUTION_ADMINISTRATOR can reject
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('INSTITUTION_ADMINISTRATOR')")
    public ResponseEntity<SharingRequest> rejectSharingRequest(@PathVariable Long id) {
        SharingRequest request = sharingRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sharing request not found"));

        request.setStatus(SharingRequestStatus.REJECTED);
        return ResponseEntity.ok(sharingRequestRepository.save(request));
    }
}
