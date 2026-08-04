package com.labresource.backend.service;

import com.labresource.backend.dto.InterInstitutionSharingRequest;
import com.labresource.backend.entity.*;
import com.labresource.backend.repository.*;
import org.springframework.stereotype.Service;
import com.labresource.backend.security.CustomUserPrincipal;
import java.util.List;

@Service
public class InterInstitutionSharingService {

    private final InterInstitutionSharingRepository sharingRepository;
    private final InstitutionRepository institutionRepository;
    private final LaboratoryRepository laboratoryRepository;
    private final EquipmentRepository equipmentRepository;

    public InterInstitutionSharingService(
            InterInstitutionSharingRepository sharingRepository,
            InstitutionRepository institutionRepository,
            LaboratoryRepository laboratoryRepository,
            EquipmentRepository equipmentRepository) {

        this.sharingRepository = sharingRepository;
        this.institutionRepository = institutionRepository;
        this.laboratoryRepository = laboratoryRepository;
        this.equipmentRepository = equipmentRepository;
    }

    // Get All
    public List<InterInstitutionSharing> getAllSharing(
        CustomUserPrincipal userPrincipal) {

        String role = userPrincipal.getRoleName();

        Long institutionId = userPrincipal.getInstitutionId();

        // SYSTEM ADMIN → Can see everything
        if (role.equals("SYSTEM_ADMIN")) {
            return sharingRepository.findAll();
        }

        // INSTITUTION ADMIN → Can see sharing related to their institution
        if (role.equals("INSTITUTION_ADMIN")) {

            return sharingRepository
                    .findByFromInstitutionInstitutionIdOrToInstitutionInstitutionId(
                            institutionId,
                            institutionId
                    );
        }

        // LAB MANAGER → We'll improve this later
        if (role.equals("LAB_MANAGER")) {

            return sharingRepository
                    .findByFromInstitutionInstitutionIdOrToInstitutionInstitutionId(
                            institutionId,
                            institutionId
                    );
        }

        // Department Head / Faculty / Student
        return sharingRepository
                .findByFromInstitutionInstitutionIdOrToInstitutionInstitutionId(
                        institutionId,
                        institutionId
                );
    }

    // Get By Id
    public InterInstitutionSharing getSharingById(Long id) {

        return sharingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sharing Record Not Found"));

    }

    // Create
    public InterInstitutionSharing createSharing(
        InterInstitutionSharingRequest request) {

    Institution fromInstitution = institutionRepository
            .findById(request.getFromInstitutionId())
            .orElseThrow(() ->
                    new RuntimeException("From Institution Not Found"));

    Institution toInstitution = institutionRepository
            .findById(request.getToInstitutionId())
            .orElseThrow(() ->
                    new RuntimeException("To Institution Not Found"));

    Laboratory laboratory = null;

    if (request.getLaboratoryId() != null) {

        laboratory = laboratoryRepository
                .findById(request.getLaboratoryId())
                .orElseThrow(() ->
                        new RuntimeException("Laboratory Not Found"));
    }

    Equipment equipment = null;

    if (request.getEquipmentId() != null) {

        equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment Not Found"));
    }

    InterInstitutionSharing sharing = new InterInstitutionSharing();

    sharing.setResourceType(request.getResourceType());

    sharing.setFromInstitution(fromInstitution);

    sharing.setToInstitution(toInstitution);

    sharing.setLaboratory(laboratory);

    sharing.setEquipment(equipment);

    sharing.setSharedQuantity(request.getSharedQuantity());

    sharing.setAvailableFrom(request.getAvailableFrom());

    sharing.setAvailableTo(request.getAvailableTo());

    sharing.setStatus("PENDING");

    sharing.setRemarks(request.getRemarks());

    return sharingRepository.save(sharing);
}

    // Update
    public InterInstitutionSharing updateSharing(
        Long id,
        InterInstitutionSharingRequest request) {

    InterInstitutionSharing sharing = getSharingById(id);

    Institution fromInstitution = institutionRepository
            .findById(request.getFromInstitutionId())
            .orElseThrow(() ->
                    new RuntimeException("From Institution Not Found"));

    Institution toInstitution = institutionRepository
            .findById(request.getToInstitutionId())
            .orElseThrow(() ->
                    new RuntimeException("To Institution Not Found"));

    sharing.setResourceType(request.getResourceType());

    sharing.setFromInstitution(fromInstitution);

    sharing.setToInstitution(toInstitution);

    if (request.getLaboratoryId() != null) {

        Laboratory laboratory = laboratoryRepository
                .findById(request.getLaboratoryId())
                .orElseThrow(() ->
                        new RuntimeException("Laboratory Not Found"));

        sharing.setLaboratory(laboratory);
    }

    if (request.getEquipmentId() != null) {

        Equipment equipment = equipmentRepository
                .findById(request.getEquipmentId())
                .orElseThrow(() ->
                        new RuntimeException("Equipment Not Found"));

        sharing.setEquipment(equipment);
    }

    sharing.setSharedQuantity(request.getSharedQuantity());

    sharing.setAvailableFrom(request.getAvailableFrom());

    sharing.setAvailableTo(request.getAvailableTo());

    sharing.setStatus(request.getStatus());

    sharing.setRemarks(request.getRemarks());

    return sharingRepository.save(sharing);
}

    // Approve Sharing
    public InterInstitutionSharing approveSharing(
            Long id,
            CustomUserPrincipal userPrincipal) {

        InterInstitutionSharing sharing = getSharingById(id);

        String role = userPrincipal.getRoleName();
        Long institutionId = userPrincipal.getInstitutionId();

        // SYSTEM_ADMIN can approve any sharing
        if (role.equals("SYSTEM_ADMIN")) {

            sharing.setStatus("APPROVED");
            return sharingRepository.save(sharing);
        }

        // INSTITUTION_ADMIN can approve only their own institution sharing
        if (role.equals("INSTITUTION_ADMIN")) {

            if (!sharing.getToInstitution()
                    .getInstitutionId()
                    .equals(institutionId)) {

                throw new RuntimeException(
                        "You are not allowed to approve this sharing.");
            }

            sharing.setStatus("APPROVED");
            return sharingRepository.save(sharing);
        }

        throw new RuntimeException(
                "You are not authorized to approve sharing.");
    }

    // Reject Sharing
    public InterInstitutionSharing rejectSharing(
            Long id,
            CustomUserPrincipal userPrincipal) {

        InterInstitutionSharing sharing = getSharingById(id);

        String role = userPrincipal.getRoleName();
        Long institutionId = userPrincipal.getInstitutionId();

        // SYSTEM_ADMIN
        if (role.equals("SYSTEM_ADMIN")) {

            sharing.setStatus("REJECTED");
            return sharingRepository.save(sharing);
        }

        // INSTITUTION_ADMIN
        if (role.equals("INSTITUTION_ADMIN")) {

            if (!sharing.getToInstitution()
                    .getInstitutionId()
                    .equals(institutionId)) {

                throw new RuntimeException(
                        "You are not allowed to reject this sharing.");
            }

            sharing.setStatus("REJECTED");
            return sharingRepository.save(sharing);
        }

        throw new RuntimeException(
                "You are not authorized to reject sharing.");
    }

    // Delete
    public void deleteSharing(Long id) {

        sharingRepository.deleteById(id);

    }

}