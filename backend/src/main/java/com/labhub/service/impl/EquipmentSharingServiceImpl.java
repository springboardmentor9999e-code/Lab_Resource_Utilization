package com.labhub.service.impl;

import com.labhub.entity.Equipment;
import com.labhub.entity.EquipmentSharing;
import com.labhub.entity.Institution;
import com.labhub.entity.User;
import com.labhub.enums.EquipmentSharingStatus;
import com.labhub.exception.ResourceNotFoundException;
import com.labhub.repository.EquipmentRepository;
import com.labhub.repository.EquipmentSharingRepository;
import com.labhub.repository.InstitutionRepository;
import com.labhub.repository.UserRepository;
import com.labhub.service.AuditLogService;
import com.labhub.service.EquipmentSharingService;
import com.labhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentSharingServiceImpl implements EquipmentSharingService {

    private final EquipmentSharingRepository equipmentSharingRepository;
    private final EquipmentRepository equipmentRepository;
    private final InstitutionRepository institutionRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public EquipmentSharing requestEquipmentSharing(String userEmail, UUID equipmentId, UUID requestingInstitutionId, String notes) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment", "id", equipmentId));

        Institution owningInst = equipment.getDepartment() != null ? equipment.getDepartment().getInstitution() : user.getInstitution();
        if (owningInst == null) {
            throw new IllegalStateException("Equipment does not belong to an institution.");
        }

        Institution requestingInst = institutionRepository.findById(requestingInstitutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institution", "id", requestingInstitutionId));

        EquipmentSharing sharing = EquipmentSharing.builder()
                .equipment(equipment)
                .owningInstitution(owningInst)
                .requestingInstitution(requestingInst)
                .requestedBy(user)
                .status(EquipmentSharingStatus.PENDING)
                .notes(notes)
                .isActive(true)
                .build();

        sharing = equipmentSharingRepository.save(sharing);

        auditLogService.log(user, "EQUIPMENT_SHARING_REQUESTED", "EquipmentSharing", sharing.getId().toString(),
                "Requested equipment sharing for " + equipment.getName() + " with " + requestingInst.getName());

        return sharing;
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentSharing> getIncomingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) return List.of();
        return equipmentSharingRepository.findByOwningInstitutionId(inst.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentSharing> getOutgoingRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) return List.of();
        return equipmentSharingRepository.findByRequestingInstitutionId(inst.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EquipmentSharing> getSharedEquipmentList(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        Institution inst = user.getInstitution() != null ? user.getInstitution() : (user.getDepartment() != null ? user.getDepartment().getInstitution() : null);
        if (inst == null) {
            return equipmentSharingRepository.findByStatus(EquipmentSharingStatus.APPROVED);
        }
        return equipmentSharingRepository.findByRequestingInstitutionIdAndStatus(inst.getId(), EquipmentSharingStatus.APPROVED);
    }

    @Override
    @Transactional
    public EquipmentSharing updateSharingStatus(UUID sharingId, EquipmentSharingStatus status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        EquipmentSharing sharing = equipmentSharingRepository.findById(sharingId)
                .orElseThrow(() -> new ResourceNotFoundException("EquipmentSharing", "id", sharingId));

        sharing.setStatus(status);
        sharing.setApprovedBy(user);
        sharing = equipmentSharingRepository.save(sharing);

        auditLogService.log(user, "EQUIPMENT_SHARING_STATUS_UPDATED", "EquipmentSharing", sharing.getId().toString(),
                "Equipment sharing status for " + sharing.getEquipment().getName() + " set to " + status.name());

        return sharing;
    }
}
