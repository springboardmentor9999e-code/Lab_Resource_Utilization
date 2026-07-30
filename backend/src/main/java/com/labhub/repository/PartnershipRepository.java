package com.labhub.repository;

import com.labhub.entity.Partnership;
import com.labhub.enums.PartnershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, UUID> {

    List<Partnership> findByRequesterInstitutionId(UUID requesterInstitutionId);

    List<Partnership> findByTargetInstitutionId(UUID targetInstitutionId);

    @Query("SELECT p FROM Partnership p WHERE (p.requesterInstitution.id = :instId OR p.targetInstitution.id = :instId)")
    List<Partnership> findAllForInstitution(@Param("instId") UUID instId);

    @Query("SELECT p FROM Partnership p WHERE " +
           "((p.requesterInstitution.id = :instA AND p.targetInstitution.id = :instB) OR " +
           "(p.requesterInstitution.id = :instB AND p.targetInstitution.id = :instA)) AND " +
           "p.status = :status")
    Optional<Partnership> findActivePartnership(
            @Param("instA") UUID instA,
            @Param("instB") UUID instB,
            @Param("status") PartnershipStatus status);
}
