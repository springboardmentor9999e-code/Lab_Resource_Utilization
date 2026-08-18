package com.lab.backend.repository;

import com.lab.backend.entity.ResourceSharingRequest;
import com.lab.backend.enums.SharingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ResourceSharingRequestRepository extends JpaRepository<ResourceSharingRequest, Long> {
    
    List<ResourceSharingRequest> findByStatus(SharingStatus status);
    
    @Query("SELECT COUNT(rsr) FROM ResourceSharingRequest rsr WHERE " +
           "rsr.providerLaboratory.id = ?1 AND rsr.requestingLaboratory.id = ?2 AND " +
           "rsr.status = 'ACTIVE' AND YEAR(rsr.startDate) = YEAR(?3) AND MONTH(rsr.startDate) = MONTH(?3)")
    Integer countActiveSharesByMonth(Long providerId, Long requestingId, LocalDate date);
    
    List<ResourceSharingRequest> findByRequestingLaboratoryId(Long requestingLaboratoryId);
    
    List<ResourceSharingRequest> findByProviderLaboratoryId(Long providerLaboratoryId);

    @Query("SELECT rsr FROM ResourceSharingRequest rsr WHERE rsr.status = ?1 ORDER BY rsr.requestDate ASC")
    List<ResourceSharingRequest> findByStatusOrderByDate(SharingStatus status);
}
