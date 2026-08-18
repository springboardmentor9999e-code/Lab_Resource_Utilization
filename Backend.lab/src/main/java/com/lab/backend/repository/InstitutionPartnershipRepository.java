package com.lab.backend.repository;

import com.lab.backend.entity.InstitutionPartnership;
import com.lab.backend.enums.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface InstitutionPartnershipRepository extends JpaRepository<InstitutionPartnership, Long> {
    
    @Query("SELECT ip FROM InstitutionPartnership ip WHERE " +
           "(ip.initiatorLaboratory.id = ?1 AND ip.partnerLaboratory.id = ?2) OR " +
           "(ip.initiatorLaboratory.id = ?2 AND ip.partnerLaboratory.id = ?1)")
    Optional<InstitutionPartnership> findByInstitutions(Long inst1, Long inst2);
    
    List<InstitutionPartnership> findByApprovalStatus(ApprovalStatus status);
    
    List<InstitutionPartnership> findByInitiatorLaboratoryId(Long laboratoryId);
}
