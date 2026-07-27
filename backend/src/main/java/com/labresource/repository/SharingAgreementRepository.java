package com.labresource.repository;

import com.labresource.entity.SharingAgreement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharingAgreementRepository extends JpaRepository<SharingAgreement, Long> {

    /** Agreements this institution is party to, in either direction. */
    @Query("SELECT a FROM SharingAgreement a " +
           "WHERE a.fromInstitution.institutionId = :institutionId " +
           "   OR a.toInstitution.institutionId = :institutionId " +
           "ORDER BY a.createdAt DESC")
    List<SharingAgreement> findForInstitution(@Param("institutionId") Long institutionId);

    /**
     * The agreement currently governing borrower -&gt; owner access, if any. Direction-specific:
     * an agreement letting A borrow from B says nothing about B borrowing from A.
     */
    @Query("SELECT a FROM SharingAgreement a " +
           "WHERE a.fromInstitution.institutionId = :fromId " +
           "  AND a.toInstitution.institutionId = :toId " +
           "  AND a.status = 'ACTIVE' " +
           "  AND a.startDate <= :onDate " +
           "  AND (a.endDate IS NULL OR a.endDate >= :onDate) " +
           "ORDER BY a.startDate DESC LIMIT 1")
    Optional<SharingAgreement> findEffective(@Param("fromId") Long fromId,
                                             @Param("toId") Long toId,
                                             @Param("onDate") LocalDate onDate);

    boolean existsByFromInstitution_InstitutionIdAndToInstitution_InstitutionIdAndStatus(
            Long fromInstitutionId, Long toInstitutionId, String status);

    /** ACTIVE agreements whose end date has passed — swept to EXPIRED. */
    @Query("SELECT a FROM SharingAgreement a WHERE a.status = 'ACTIVE' " +
           "AND a.endDate IS NOT NULL AND a.endDate < :today")
    List<SharingAgreement> findLapsed(@Param("today") LocalDate today);
}
