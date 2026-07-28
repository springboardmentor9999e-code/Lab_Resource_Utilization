package com.lrplatform.repository;

import com.lrplatform.model.entity.Invoice;
import com.lrplatform.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    Page<Invoice> findByInstitutionIdOrderByGeneratedAtDesc(Long institutionId, Pageable pageable);
    
    Page<Invoice> findByPaymentStatusOrderByDueDateAsc(PaymentStatus status, Pageable pageable);
    
    Page<Invoice> findByInstitutionIdAndPaymentStatusOrderByGeneratedAtDesc(Long institutionId, PaymentStatus status, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i")
    BigDecimal sumTotalAmount();
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.paymentStatus = 'PENDING' OR i.paymentStatus = 'PARTIALLY_PAID'")
    BigDecimal sumPendingAmount();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE (i.paymentStatus = 'PENDING' OR i.paymentStatus = 'PARTIALLY_PAID') AND i.institution.id = :institutionId")
    BigDecimal sumPendingAmountByInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.paymentStatus = 'PAID'")
    BigDecimal sumPaidAmount();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.dueDate < CURRENT_DATE AND i.paymentStatus IN ('PENDING', 'PARTIALLY_PAID')")
    BigDecimal sumOverdueAmount();

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.dueDate < CURRENT_DATE AND i.paymentStatus IN ('PENDING', 'PARTIALLY_PAID') AND i.institution.id = :institutionId")
    BigDecimal sumOverdueAmountByInstitution(@Param("institutionId") Long institutionId);
    
    long countByPaymentStatus(PaymentStatus status);
    
    long countByInstitutionId(Long institutionId);
    
    long countByInstitutionIdAndPaymentStatus(Long institutionId, PaymentStatus status);
    
    @Query("SELECT i.institution.id, COALESCE(SUM(i.totalAmount), 0), COUNT(i) FROM Invoice i GROUP BY i.institution.id")
    List<Object[]> sumByInstitution();
    
    @Query("SELECT i.institution.id, COALESCE(SUM(i.totalAmount), 0), COUNT(i) FROM Invoice i WHERE i.paymentStatus = 'PAID' GROUP BY i.institution.id")
    List<Object[]> sumPaidByInstitution();
    
    List<Invoice> findByDueDateBeforeAndPaymentStatusIn(LocalDate dueDate, List<PaymentStatus> statuses);
    
    @Query(value = "SELECT EXTRACT(MONTH FROM i.generated_at), COALESCE(SUM(i.total_amount), 0), COUNT(i) FROM invoices i WHERE EXTRACT(YEAR FROM i.generated_at) = :year GROUP BY EXTRACT(MONTH FROM i.generated_at) ORDER BY EXTRACT(MONTH FROM i.generated_at)", nativeQuery = true)
    List<Object[]> monthlyRevenueByYear(@Param("year") int year);
}
