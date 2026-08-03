package com.labresource.repository;

import com.labresource.entity.SharingRequest;
import com.labresource.entity.SharingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {

    boolean existsByEquipmentIdAndRequestingInstitutionIdAndStatus(
            Long equipmentId, Long requestingInstitutionId, SharingRequestStatus status);
}