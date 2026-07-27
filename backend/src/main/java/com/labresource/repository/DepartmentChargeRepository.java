package com.labresource.repository;

import com.labresource.entity.DepartmentCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface DepartmentChargeRepository extends JpaRepository<DepartmentCharge, Long> {

    boolean existsByBooking_BookingId(Long bookingId);

    boolean existsByMaintenanceRequest_RequestId(Long requestId);

    /** Ledger for one department over a window, newest first. */
    List<DepartmentCharge> findByDepartment_DepartmentIdAndChargeDateBetweenOrderByChargeDateDescChargeIdDesc(
            Long departmentId, LocalDate from, LocalDate to);

    /** COALESCE keeps a department with no charges yet at 0.00 instead of null. */
    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DepartmentCharge c " +
           "WHERE c.department.departmentId = :departmentId " +
           "AND c.chargeDate BETWEEN :from AND :to")
    BigDecimal sumForDepartment(@Param("departmentId") Long departmentId,
                                @Param("from") LocalDate from,
                                @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM DepartmentCharge c " +
           "WHERE c.department.departmentId = :departmentId AND c.chargeType = :chargeType " +
           "AND c.chargeDate BETWEEN :from AND :to")
    BigDecimal sumForDepartmentByType(@Param("departmentId") Long departmentId,
                                      @Param("chargeType") String chargeType,
                                      @Param("from") LocalDate from,
                                      @Param("to") LocalDate to);
}
