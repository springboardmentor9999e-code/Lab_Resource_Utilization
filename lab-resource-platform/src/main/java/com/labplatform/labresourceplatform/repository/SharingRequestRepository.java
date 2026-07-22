package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.SharingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SharingRequestRepository extends JpaRepository<SharingRequest, Long> {

    List<SharingRequest> findByRequestedBy_UserId(Long userId);

    // A request is "relevant" to an institution if that institution is either the
    // requester or the owner side of the sharing arrangement.
    @Query("SELECT sr FROM SharingRequest sr WHERE " +
           "sr.requesterInstitution.institutionId = :institutionId OR " +
           "sr.ownerInstitution.institutionId = :institutionId")
    List<SharingRequest> findByInstitutionInvolved(@Param("institutionId") Long institutionId);
}
