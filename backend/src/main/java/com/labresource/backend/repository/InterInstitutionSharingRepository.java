package com.labresource.backend.repository;

import com.labresource.backend.entity.InterInstitutionSharing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterInstitutionSharingRepository
        extends JpaRepository<InterInstitutionSharing, Long> {

    List<InterInstitutionSharing>
    findByFromInstitutionInstitutionIdOrToInstitutionInstitutionId(
            Long fromInstitutionId,
            Long toInstitutionId
    );

    List<InterInstitutionSharing> findByStatus(String status);

    List<InterInstitutionSharing> findByLaboratoryLabId(Long labId);

    List<InterInstitutionSharing> findByEquipmentEquipmentId(Long equipmentId);

    @Query("""
        SELECT
        s.fromInstitution.institutionName,
        COUNT(s)
        FROM InterInstitutionSharing s
        GROUP BY s.fromInstitution.institutionName
        ORDER BY COUNT(s) DESC
        """)
        List<Object[]> getInstitutionSharingReport();
}