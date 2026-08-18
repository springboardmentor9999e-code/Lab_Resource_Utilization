package com.lab.backend.repository;

import com.lab.backend.entity.SharingAgreement;
import com.lab.backend.enums.SharingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharingAgreementRepository extends JpaRepository<SharingAgreement, Long> {

    List<SharingAgreement> findByStatus(SharingStatus status);

    List<SharingAgreement> findByProviderLaboratoryId(Long providerLabId);

    List<SharingAgreement> findByRequestingLaboratoryId(Long requestingLabId);

    @Query("SELECT sa FROM SharingAgreement sa WHERE sa.providerLaboratory.id = :labId OR sa.requestingLaboratory.id = :labId")
    List<SharingAgreement> findByLaboratoryId(@Param("labId") Long labId);

    Optional<SharingAgreement> findByAgreementNumber(String agreementNumber);
}
