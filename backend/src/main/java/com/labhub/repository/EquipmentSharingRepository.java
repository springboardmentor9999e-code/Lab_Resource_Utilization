package com.labhub.repository;

import com.labhub.entity.EquipmentSharing;
import com.labhub.enums.EquipmentSharingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EquipmentSharingRepository extends JpaRepository<EquipmentSharing, UUID> {

    List<EquipmentSharing> findByOwningInstitutionId(UUID owningInstitutionId);

    List<EquipmentSharing> findByRequestingInstitutionId(UUID requestingInstitutionId);

    List<EquipmentSharing> findByRequestingInstitutionIdAndStatus(UUID requestingInstitutionId, EquipmentSharingStatus status);

    List<EquipmentSharing> findByStatus(EquipmentSharingStatus status);
}
