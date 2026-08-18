package com.lab.backend.repository;

import com.lab.backend.entity.EquipmentCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentCostRepository extends JpaRepository<EquipmentCost, Long> {

    List<EquipmentCost> findByStatus(String status);
    List<EquipmentCost> findByDepartment(String department);
    Optional<EquipmentCost> findByEquipmentCode(String equipmentCode);
    List<EquipmentCost> findByDepartmentAndStatus(String department, String status);

    @Query("SELECT ec.department, SUM(ec.monthlyCost) as totalCost " +
           "FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' " +
           "GROUP BY ec.department ORDER BY SUM(ec.monthlyCost) DESC")
    List<Object[]> getDepartmentCosts();

    @Query("SELECT ec.department, SUM(ec.monthlyCost) as totalCost " +
           "FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' AND ec.department = :department " +
           "GROUP BY ec.department")
    Optional<Object[]> getDepartmentCostByName(@Param("department") String department);

    @Query("SELECT SUM(ec.monthlyCost) FROM EquipmentCost ec WHERE ec.status = 'ACTIVE'")
    BigDecimal getTotalMonthlyCost();

    @Query("SELECT SUM(ec.monthlyCost) FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' AND ec.department = :department")
    BigDecimal getMonthlyCostByDepartment(@Param("department") String department);

    @Query("SELECT EXTRACT(YEAR FROM ec.costEffectiveDate) as year, EXTRACT(MONTH FROM ec.costEffectiveDate) as month, SUM(ec.monthlyCost) as cost " +
           "FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' AND ec.costEffectiveDate <= CURRENT_DATE " +
           "GROUP BY EXTRACT(YEAR FROM ec.costEffectiveDate), EXTRACT(MONTH FROM ec.costEffectiveDate) " +
           "ORDER BY EXTRACT(YEAR FROM ec.costEffectiveDate) DESC, EXTRACT(MONTH FROM ec.costEffectiveDate) DESC")
    List<Object[]> getBillingByMonth();

    @Query("SELECT EXTRACT(YEAR FROM ec.costEffectiveDate) as year, SUM(ec.monthlyCost) as cost " +
           "FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' " +
           "GROUP BY EXTRACT(YEAR FROM ec.costEffectiveDate) ORDER BY EXTRACT(YEAR FROM ec.costEffectiveDate) DESC")
    List<Object[]> getBillingByYear();

    @Query("SELECT ec FROM EquipmentCost ec WHERE ec.status = 'ACTIVE' AND ec.costEffectiveDate BETWEEN :startDate AND :endDate " +
           "ORDER BY ec.department")
    List<EquipmentCost> getBillingByDateRange(@Param("startDate") LocalDate startDate, 
                                              @Param("endDate") LocalDate endDate);

    @Query("SELECT ec.department, SUM(ec.monthlyCost) as totalCost FROM EquipmentCost ec " +
           "WHERE ec.status = 'ACTIVE' AND ec.costEffectiveDate BETWEEN :startDate AND :endDate " +
           "GROUP BY ec.department")
    List<Object[]> getBillingByDepartmentAndDateRange(@Param("startDate") LocalDate startDate, 
                                                       @Param("endDate") LocalDate endDate);
}
