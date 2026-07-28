package com.lrplatform.repository;

import com.lrplatform.model.entity.Payment;
import com.lrplatform.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByInvoiceIdOrderByPaymentDateDesc(Long invoiceId);
    
    Page<Payment> findByPaymentDateBetweenOrderByPaymentDateDesc(LocalDateTime from, LocalDateTime to, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.paymentStatus = 'PAID'")
    BigDecimal sumTotalPaid();
    
    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.paymentDate BETWEEN :from AND :to")
    BigDecimal sumTotalPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
    
    @Query("SELECT p.paymentMethod, COUNT(p), SUM(p.amountPaid) FROM Payment p WHERE p.paymentStatus = 'PAID' GROUP BY p.paymentMethod")
    List<Object[]> countByPaymentMethod();
    
    long countByPaymentStatus(PaymentStatus status);

    @Query("SELECT p FROM Payment p WHERE p.invoice.institution.id = :institutionId ORDER BY p.paymentDate DESC")
    Page<Payment> findByInstitutionId(@Param("institutionId") Long institutionId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.invoice.institution.id = :institutionId AND p.paymentDate BETWEEN :from AND :to ORDER BY p.paymentDate DESC")
    Page<Payment> findByInstitutionIdAndPaymentDateBetween(@Param("institutionId") Long institutionId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.invoice.institution.id = :institutionId")
    BigDecimal sumTotalPaidByInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT p.paymentMethod, COUNT(p), SUM(p.amountPaid) FROM Payment p WHERE p.paymentStatus = 'PAID' AND p.invoice.institution.id = :institutionId GROUP BY p.paymentMethod")
    List<Object[]> countByPaymentMethodByInstitution(@Param("institutionId") Long institutionId);
}
