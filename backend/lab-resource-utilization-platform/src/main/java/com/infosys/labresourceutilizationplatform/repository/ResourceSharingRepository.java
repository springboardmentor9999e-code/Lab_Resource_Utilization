package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.ResourceSharing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceSharingRepository extends JpaRepository<ResourceSharing, Long> {

    // Incoming requests for equipment owner institution
    List<ResourceSharing> findByOwnerInstitutionInstitutionId(Long ownerInstitutionId);

    // Outgoing requests from requesting institution
    List<ResourceSharing> findBySharedWithInstitutionInstitutionId(Long sharedWithInstitutionId);

    // Requests initiated by a specific user
    List<ResourceSharing> findByRequestedByUserId(Integer userId);

    // Filter by status
    List<ResourceSharing> findByStatus(String status);

    // Active or Approved shared equipment to a given institution
    List<ResourceSharing> findBySharedWithInstitutionInstitutionIdAndStatusIn(Long institutionId, List<String> statuses);

    // Active or Approved sharing for specific equipment
    List<ResourceSharing> findByEquipmentIdAndStatusIn(Long equipmentId, List<String> statuses);

    // Check if equipment is actively shared with an institution on a date
    @Query("SELECT rs FROM ResourceSharing rs WHERE rs.equipment.id = :equipmentId " +
           "AND rs.sharedWithInstitution.institutionId = :institutionId " +
           "AND rs.status IN ('Approved', 'Active')")
    List<ResourceSharing> findActiveSharingForEquipmentAndInstitution(
            @Param("equipmentId") Long equipmentId,
            @Param("institutionId") Long institutionId);

    // Global order by created date desc
    List<ResourceSharing> findAllByOrderByCreatedAtDesc();
}
