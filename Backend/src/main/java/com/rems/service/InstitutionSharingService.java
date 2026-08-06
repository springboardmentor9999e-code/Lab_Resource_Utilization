package com.rems.service;

import com.rems.dto.*;
import com.rems.entity.*;
import com.rems.enums.InstitutionStatus;
import com.rems.enums.NotificationType;
import com.rems.enums.SharingStatus;
import com.rems.exception.ApiException;
import com.rems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InstitutionSharingService {

    private final InstitutionSharingAgreementRepository sharingAgreementRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final InAppNotificationService inAppNotificationService;
    private final NotificationService notificationService;

    // 1. Explore Institutions directory with current sharing status
    public List<InstitutionDirectoryResponse> getApprovedInstitutionsDirectory(String userEmail) {
        User user = getUser(userEmail);
        Institution myInst = getInstitution(user);

        List<Institution> activeInstitutions = institutionRepository.findByStatus(InstitutionStatus.ACTIVE);

        return activeInstitutions.stream()
                .filter(inst -> !inst.getInstitutionId().equals(myInst.getInstitutionId()))
                .map(inst -> {
                    Optional<InstitutionSharingAgreement> agreementOpt = 
                            sharingAgreementRepository.findActiveOrPendingAgreementBetween(myInst.getInstitutionId(), inst.getInstitutionId());

                    String agreementStatus = "NONE";
                    Long agreementId = null;

                    if (agreementOpt.isPresent()) {
                        InstitutionSharingAgreement ag = agreementOpt.get();
                        agreementStatus = ag.getStatus().name();
                        agreementId = ag.getSharingId();
                    }

                    return InstitutionDirectoryResponse.builder()
                            .institutionId(inst.getInstitutionId())
                            .name(inst.getName())
                            .type(inst.getType())
                            .address(inst.getAddress())
                            .contactEmail(inst.getContactEmail())
                            .contactPhone(inst.getContactPhone())
                            .status(inst.getStatus().name())
                            .agreementStatus(agreementStatus)
                            .agreementId(agreementId)
                            .createdAt(inst.getCreatedAt())
                            .build();
                })
                .toList();
    }

    // 2. Fetch agreements for logged-in institution admin
    public List<SharingAgreementResponse> getAgreements(String userEmail, String statusFilter) {
        User user = getUser(userEmail);
        Institution myInst = getInstitution(user);

        List<InstitutionSharingAgreement> agreements;
        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            try {
                SharingStatus statusEnum = SharingStatus.valueOf(statusFilter.toUpperCase());
                agreements = sharingAgreementRepository.findAllByInstitutionIdAndStatus(myInst.getInstitutionId(), statusEnum);
            } catch (IllegalArgumentException e) {
                agreements = sharingAgreementRepository.findAllByInstitutionId(myInst.getInstitutionId());
            }
        } else {
            agreements = sharingAgreementRepository.findAllByInstitutionId(myInst.getInstitutionId());
        }

        return agreements.stream()
                .map(ag -> toSharingResponse(ag, myInst.getInstitutionId()))
                .toList();
    }

    // 3. Initiate resource sharing request
    @Transactional
    public SharingAgreementResponse createRequest(String userEmail, SharingAgreementRequest request) {
        User user = getUser(userEmail);
        verifyInstAdmin(user);
        Institution myInst = getInstitution(user);

        if (myInst.getInstitutionId().equals(request.getTargetInstitutionId())) {
            throw new ApiException("Cannot request resource sharing with your own institution", HttpStatus.BAD_REQUEST);
        }

        Institution targetInst = institutionRepository.findById(request.getTargetInstitutionId())
                .orElseThrow(() -> new ApiException("Target institution not found", HttpStatus.NOT_FOUND));

        if (targetInst.getStatus() != InstitutionStatus.ACTIVE) {
            throw new ApiException("Target institution is not active", HttpStatus.BAD_REQUEST);
        }

        Optional<InstitutionSharingAgreement> existingOpt = 
                sharingAgreementRepository.findActiveOrPendingAgreementBetween(myInst.getInstitutionId(), targetInst.getInstitutionId());

        if (existingOpt.isPresent()) {
            throw new ApiException("A sharing agreement or request already exists with " + targetInst.getName(), HttpStatus.CONFLICT);
        }

        if (!Boolean.TRUE.equals(request.getTermsAccepted())) {
            throw new ApiException("Terms and conditions must be accepted to request resource sharing", HttpStatus.BAD_REQUEST);
        }

        InstitutionSharingAgreement agreement = InstitutionSharingAgreement.builder()
                .requesterInstitution(myInst)
                .targetInstitution(targetInst)
                .purpose(request.getPurpose())
                .termsAccepted(true)
                .status(SharingStatus.PENDING)
                .build();

        InstitutionSharingAgreement saved = sharingAgreementRepository.save(agreement);

        // Notify target institution administrators
        List<User> targetAdmins = userRepository.findByInstitutionInstitutionId(targetInst.getInstitutionId());
        int notifCount = 0;
        for (User admin : targetAdmins) {
            if (isInstAdminUser(admin)) {
                String title = "New Resource Sharing Request";
                String msg = "Institution '" + myInst.getName() + "' requested a reciprocal resource sharing tie-up. Purpose: " + request.getPurpose();
                inAppNotificationService.createNotification(admin, title, msg, NotificationType.SHARING_REQUEST, saved.getSharingId());
                notificationService.sendApprovalRequestNotification(admin, title, msg);
                notifCount++;
            }
        }

        if (notifCount == 0) {
            List<User> allUsers = userRepository.findAll();
            for (User admin : allUsers) {
                if (admin.getInstitution() != null && 
                    admin.getInstitution().getInstitutionId().equals(targetInst.getInstitutionId()) && 
                    isInstAdminUser(admin)) {
                    String title = "New Resource Sharing Request";
                    String msg = "Institution '" + myInst.getName() + "' requested a reciprocal resource sharing tie-up. Purpose: " + request.getPurpose();
                    inAppNotificationService.createNotification(admin, title, msg, NotificationType.SHARING_REQUEST, saved.getSharingId());
                    notificationService.sendApprovalRequestNotification(admin, title, msg);
                }
            }
        }

        return toSharingResponse(saved, myInst.getInstitutionId());
    }

    // 4. Approve reciprocal sharing request
    @Transactional
    public SharingAgreementResponse approveAgreement(Long sharingId, String userEmail) {
        User user = getUser(userEmail);
        verifyInstAdmin(user);
        Institution myInst = getInstitution(user);

        InstitutionSharingAgreement agreement = sharingAgreementRepository.findById(sharingId)
                .orElseThrow(() -> new ApiException("Sharing agreement not found", HttpStatus.NOT_FOUND));

        if (!agreement.getTargetInstitution().getInstitutionId().equals(myInst.getInstitutionId())) {
            throw new ApiException("Only the target institution administrator can approve this request", HttpStatus.FORBIDDEN);
        }

        if (agreement.getStatus() != SharingStatus.PENDING) {
            throw new ApiException("Agreement is not in PENDING status (current status: " + agreement.getStatus() + ")", HttpStatus.BAD_REQUEST);
        }

        agreement.setStatus(SharingStatus.APPROVED);
        InstitutionSharingAgreement saved = sharingAgreementRepository.save(agreement);

        // Notify requester institution administrators
        List<User> requesterAdmins = userRepository.findByInstitutionInstitutionId(agreement.getRequesterInstitution().getInstitutionId());
        for (User admin : requesterAdmins) {
            if (isInstAdminUser(admin)) {
                String title = "Resource Sharing Approved";
                String msg = "Institution '" + myInst.getName() + "' has approved your resource sharing request! You may now browse and access shared equipment.";
                inAppNotificationService.createNotification(admin, title, msg, NotificationType.SHARING_APPROVED, saved.getSharingId());
            }
        }

        return toSharingResponse(saved, myInst.getInstitutionId());
    }

    // 5. Reject sharing request
    @Transactional
    public SharingAgreementResponse rejectAgreement(Long sharingId, String userEmail) {
        User user = getUser(userEmail);
        verifyInstAdmin(user);
        Institution myInst = getInstitution(user);

        InstitutionSharingAgreement agreement = sharingAgreementRepository.findById(sharingId)
                .orElseThrow(() -> new ApiException("Sharing agreement not found", HttpStatus.NOT_FOUND));

        if (!agreement.getTargetInstitution().getInstitutionId().equals(myInst.getInstitutionId())) {
            throw new ApiException("Only the target institution administrator can reject this request", HttpStatus.FORBIDDEN);
        }

        if (agreement.getStatus() != SharingStatus.PENDING) {
            throw new ApiException("Agreement is not in PENDING status", HttpStatus.BAD_REQUEST);
        }

        agreement.setStatus(SharingStatus.REJECTED);
        InstitutionSharingAgreement saved = sharingAgreementRepository.save(agreement);

        List<User> requesterAdmins = userRepository.findByInstitutionInstitutionId(agreement.getRequesterInstitution().getInstitutionId());
        for (User admin : requesterAdmins) {
            if (isInstAdminUser(admin)) {
                String title = "Resource Sharing Request Declined";
                String msg = "Institution '" + myInst.getName() + "' declined the resource sharing request.";
                inAppNotificationService.createNotification(admin, title, msg, NotificationType.SHARING_REJECTED, saved.getSharingId());
            }
        }

        return toSharingResponse(saved, myInst.getInstitutionId());
    }

    // 6. Fetch partner institution equipment (only if tie-up is APPROVED)
    public List<EquipmentResponse> getPartnerEquipment(Long partnerInstitutionId, String userEmail) {
        User user = getUser(userEmail);
        Institution myInst = getInstitution(user);

        Optional<InstitutionSharingAgreement> approvedAgreementOpt = 
                sharingAgreementRepository.findApprovedAgreementBetween(myInst.getInstitutionId(), partnerInstitutionId);

        if (approvedAgreementOpt.isEmpty()) {
            throw new ApiException("No active resource sharing agreement exists with this institution", HttpStatus.FORBIDDEN);
        }

        List<Equipment> equipmentList = equipmentRepository.findByInstitutionInstitutionId(partnerInstitutionId);

        return equipmentList.stream().map(this::toEquipmentResponse).toList();
    }

    // Helpers
    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }

    private Institution getInstitution(User user) {
        if (user.getInstitution() == null) {
            throw new ApiException("User is not associated with any institution", HttpStatus.BAD_REQUEST);
        }
        return user.getInstitution();
    }

    private void verifyInstAdmin(User user) {
        boolean isInstAdmin = isInstAdminUser(user);
        if (!isInstAdmin) {
            throw new ApiException("Only Institution Administrators can manage resource sharing agreements", HttpStatus.FORBIDDEN);
        }
    }

    private boolean isInstAdminUser(User user) {
        if (user == null) return false;
        boolean hasRoleIdInList = user.getRoleIds() != null && user.getRoleIds().contains(5);
        boolean hasRoleInSet = user.getRoles() != null && user.getRoles().stream().anyMatch(r -> 
                (r.getRoleId() != null && r.getRoleId() == 5) || 
                (r.getPermissions() != null && r.getPermissions().contains("manage_sharing_agreements")));
        return hasRoleIdInList || hasRoleInSet;
    }

    private SharingAgreementResponse toSharingResponse(InstitutionSharingAgreement agreement, Long myInstId) {
        boolean isIncoming = agreement.getTargetInstitution().getInstitutionId().equals(myInstId);
        return SharingAgreementResponse.builder()
                .sharingId(agreement.getSharingId())
                .requesterInstitutionId(agreement.getRequesterInstitution().getInstitutionId())
                .requesterInstitutionName(agreement.getRequesterInstitution().getName())
                .requesterContactEmail(agreement.getRequesterInstitution().getContactEmail())
                .targetInstitutionId(agreement.getTargetInstitution().getInstitutionId())
                .targetInstitutionName(agreement.getTargetInstitution().getName())
                .targetContactEmail(agreement.getTargetInstitution().getContactEmail())
                .status(agreement.getStatus().name())
                .termsAccepted(agreement.getTermsAccepted())
                .purpose(agreement.getPurpose())
                .isIncoming(isIncoming)
                .createdAt(agreement.getCreatedAt())
                .updatedAt(agreement.getUpdatedAt())
                .build();
    }

    private EquipmentResponse toEquipmentResponse(Equipment equipment) {
        return EquipmentResponse.builder()
                .equipmentId(equipment.getEquipmentId())
                .name(equipment.getName())
                .category(equipment.getCategory())
                .model(equipment.getModel())
                .cost(equipment.getCost())
                .status(equipment.getStatus().name())
                .location(equipment.getLocation())
                .amount(equipment.getAmount())
                .manual(equipment.getManual())
                .imageUrl(equipment.getImageUrl())
                .institutionId(equipment.getInstitution() != null ? equipment.getInstitution().getInstitutionId() : null)
                .institutionName(equipment.getInstitution() != null ? equipment.getInstitution().getName() : null)
                .departmentId(equipment.getDepartment() != null ? equipment.getDepartment().getDepartmentId() : null)
                .departmentName(equipment.getDepartment() != null ? equipment.getDepartment().getName() : null)
                .labId(equipment.getLab() != null ? equipment.getLab().getLabId() : null)
                .labName(equipment.getLab() != null ? equipment.getLab().getName() : null)
                .createdAt(equipment.getCreatedAt())
                .updatedAt(equipment.getUpdatedAt())
                .build();
    }
}
