package com.rems.repository;

import com.rems.entity.InstitutionSharingAgreement;
import com.rems.enums.SharingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstitutionSharingAgreementRepository extends JpaRepository<InstitutionSharingAgreement, Long> {

    @Query("SELECT a FROM InstitutionSharingAgreement a WHERE " +
           "(a.requesterInstitution.institutionId = :instId OR a.targetInstitution.institutionId = :instId)")
    List<InstitutionSharingAgreement> findAllByInstitutionId(@Param("instId") Long instId);

    @Query("SELECT a FROM InstitutionSharingAgreement a WHERE " +
           "(a.requesterInstitution.institutionId = :instId OR a.targetInstitution.institutionId = :instId) " +
           "AND a.status = :status")
    List<InstitutionSharingAgreement> findAllByInstitutionIdAndStatus(@Param("instId") Long instId, @Param("status") SharingStatus status);

    @Query("SELECT a FROM InstitutionSharingAgreement a WHERE " +
           "((a.requesterInstitution.institutionId = :instA AND a.targetInstitution.institutionId = :instB) OR " +
           " (a.requesterInstitution.institutionId = :instB AND a.targetInstitution.institutionId = :instA)) " +
           "AND a.status != 'REVOKED' AND a.status != 'REJECTED'")
    Optional<InstitutionSharingAgreement> findActiveOrPendingAgreementBetween(@Param("instA") Long instA, @Param("instB") Long instB);

    @Query("SELECT a FROM InstitutionSharingAgreement a WHERE " +
           "((a.requesterInstitution.institutionId = :instA AND a.targetInstitution.institutionId = :instB) OR " +
           " (a.requesterInstitution.institutionId = :instB AND a.targetInstitution.institutionId = :instA)) " +
           "AND a.status = 'APPROVED'")
    Optional<InstitutionSharingAgreement> findApprovedAgreementBetween(@Param("instA") Long instA, @Param("instB") Long instB);
}
