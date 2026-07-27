package com.labresource.repository;

import com.labresource.entity.SharingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {

    List<SharingRequest> findByToInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    List<SharingRequest> findByRequestedBy_UserIdOrderByCreatedAtDesc(Long userId);

    List<SharingRequest> findByFromInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    long countByStatus(String status);

    @Query("SELECT COUNT(sr) > 0 FROM SharingRequest sr WHERE sr.requestedBy.userId = :userId " +
           "AND sr.equipment.equipmentId = :equipmentId AND sr.requestedDate = :date " +
           "AND sr.status = 'PENDING'")
    boolean existsPendingDuplicate(
            @Param("userId") Long userId,
            @Param("equipmentId") Long equipmentId,
            @Param("date") LocalDate date
    );

    /**
     * Requests made under one agreement within a date range, restricted to the statuses that
     * actually consume its monthly quota.
     */
    @Query("SELECT sr FROM SharingRequest sr WHERE sr.agreement.agreementId = :agreementId " +
           "AND sr.requestedDate >= :from AND sr.requestedDate <= :to " +
           "AND sr.status IN :statuses")
    List<SharingRequest> findByAgreementInMonth(@Param("agreementId") Long agreementId,
                                                @Param("from") LocalDate from,
                                                @Param("to") LocalDate to,
                                                @Param("statuses") List<String> statuses);
}
