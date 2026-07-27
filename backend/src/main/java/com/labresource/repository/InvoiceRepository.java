package com.labresource.repository;

import com.labresource.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByFromInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    List<Invoice> findByToInstitution_InstitutionIdOrderByCreatedAtDesc(Long institutionId);

    boolean existsBySharingRequest_SharingRequestId(Long sharingRequestId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i " +
           "WHERE i.fromInstitution.institutionId = :institutionId AND i.status = :status")
    BigDecimal sumByFromInstitutionAndStatus(@Param("institutionId") Long institutionId,
                                             @Param("status") String status);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i " +
           "WHERE i.toInstitution.institutionId = :institutionId AND i.status = :status")
    BigDecimal sumByToInstitutionAndStatus(@Param("institutionId") Long institutionId,
                                           @Param("status") String status);
}
