package com.labresource.backend.repository;

import com.labresource.backend.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;


@Repository
public interface BillingRepository
        extends JpaRepository<Billing, Long> {

    @Query("""
    SELECT
    b.booking.user.department,
    COUNT(b),
    SUM(b.totalCost)
    FROM Billing b
    GROUP BY b.booking.user.department
    """)
    List<Object[]> getDepartmentWiseCost();

    List<Billing> findByDepartmentHeadUserId(Long userId);

    List<Billing> findByInstitutionInstitutionId(Long institutionId);

    List<Billing> findByPaymentStatus(String paymentStatus);
    
    

}