package com.labhub.service.impl;

import com.labhub.entity.Institution;
import com.labhub.entity.Partnership;
import com.labhub.entity.User;
import com.labhub.enums.NotificationType;
import com.labhub.enums.PartnershipStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.InstitutionRepository;
import com.labhub.repository.PartnershipRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.AuditLogService;
import com.labhub.service.NotificationService;
import com.labhub.service.PartnershipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PartnershipServiceImpl implements PartnershipService {

    private final PartnershipRepository partnershipRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public Partnership requestPartnership(String userEmail, UUID targetInstitutionId, String notes) {
        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Institution requesterInst = requester.getInstitution();
        if (requesterInst == null && requester.getDepartment() != null) {
            requesterInst = requester.getDepartment().getInstitution();
        }
        if (requesterInst == null) {
            throw new IllegalStateException("User does not belong to any institution.");
        }

        Institution targetInst = institutionRepository.findById(targetInstitutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", targetInstitutionId));

        Partnership partnership = Partnership.builder()
                .requesterInstitution(requesterInst)
                .targetInstitution(targetInst)
                .status(PartnershipStatus.PENDING)
                .notes(notes)
                .isActive(true)
                .build();

        partnership = partnershipRepository.save(partnership);

        auditLogService.log(requester, "PARTNERSHIP_REQUESTED", "Partnership", partnership.getId().toString(),
                "Requested partnership with " + targetInst.getName());

        return partnership;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Partnership> getIncomingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) return List.of();
        return partnershipRepository.findByTargetInstitutionId(inst.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Partnership> getOutgoingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) return List.of();
        return partnershipRepository.findByRequesterInstitutionId(inst.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Partnership> getAllPartnerships(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) return partnershipRepository.findAll();
        return partnershipRepository.findAllForInstitution(inst.getId());
    }

    @Override
    @Transactional
    public Partnership updatePartnershipStatus(UUID partnershipId, PartnershipStatus status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Partnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Partnership", "id", partnershipId));

        partnership.setStatus(status);
        partnership = partnershipRepository.save(partnership);

        auditLogService.log(user, "PARTNERSHIP_STATUS_UPDATED", "Partnership", partnership.getId().toString(),
                "Partnership between " + partnership.getRequesterInstitution().getName() + " and " +
                        partnership.getTargetInstitution().getName() + " set to " + status.name());

        return partnership;
    }
}
