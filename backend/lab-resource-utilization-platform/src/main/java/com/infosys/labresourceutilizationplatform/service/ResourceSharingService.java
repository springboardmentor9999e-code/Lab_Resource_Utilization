package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.dto.ResourceSharingAnalyticsDTO;
import com.infosys.labresourceutilizationplatform.dto.ResourceSharingRequestDTO;
import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.entity.ResourceSharing;

import java.util.List;

public interface ResourceSharingService {

    ResourceSharing createSharingRequest(ResourceSharingRequestDTO dto, String userEmail);

    ResourceSharing approveSharingRequest(Long sharingId, String approverEmail);

    ResourceSharing rejectSharingRequest(Long sharingId, String reason, String approverEmail);

    ResourceSharing cancelSharingRequest(Long sharingId, String userEmail);

    List<ResourceSharing> getIncomingRequests(String userEmail);

    List<ResourceSharing> getOutgoingRequests(String userEmail);

    List<ResourceSharing> getMyRequests(String userEmail);

    List<ResourceSharing> getAllRequests(String userEmail);

    List<Equipment> getAvailableEquipmentForSharing(String userEmail, Long targetInstitutionId);

    List<Equipment> getActiveSharedEquipmentForInstitution(Long institutionId);

    ResourceSharing getSharingRequestById(Long sharingId);

    ResourceSharingAnalyticsDTO getSharingAnalytics(String timeframe, java.time.LocalDate startDate, java.time.LocalDate endDate, Long institutionId, Long departmentId, Long laboratoryId, Long equipmentId, String userEmail);

    java.util.Map<String, Object> getSharingStats(String userEmail);
}
