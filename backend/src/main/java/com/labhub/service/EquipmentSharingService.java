package com.labhub.service;

import com.labhub.entity.EquipmentSharing;
import com.labhub.enums.EquipmentSharingStatus;

import java.util.List;
import java.util.UUID;

public interface EquipmentSharingService {
    EquipmentSharing requestEquipmentSharing(String userEmail, UUID equipmentId, UUID requestingInstitutionId, String notes);
    List<EquipmentSharing> getIncomingRequests(String userEmail);
    List<EquipmentSharing> getOutgoingRequests(String userEmail);
    List<EquipmentSharing> getSharedEquipmentList(String userEmail);
    EquipmentSharing updateSharingStatus(UUID sharingId, EquipmentSharingStatus status, String userEmail);
}
