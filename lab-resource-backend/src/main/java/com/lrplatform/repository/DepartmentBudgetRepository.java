package com.lrplatform.repository;

import com.lrplatform.model.entity.DepartmentBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentBudgetRepository extends JpaRepository<DepartmentBudget, Long> {

    Optional<DepartmentBudget> findByDepartmentIdAndFiscalYear(Long departmentId, Integer fiscalYear);

    List<DepartmentBudget> findByFiscalYear(Integer fiscalYear);

    @Query("SELECT db FROM DepartmentBudget db WHERE db.department.institution.id = :institutionId AND db.fiscalYear = :fiscalYear")
    List<DepartmentBudget> findByInstitutionIdAndFiscalYear(@Param("institutionId") Long institutionId, @Param("fiscalYear") Integer fiscalYear);

    @Query("SELECT db FROM DepartmentBudget db WHERE db.department.institution.id = :institutionId")
    List<DepartmentBudget> findByInstitutionId(@Param("institutionId") Long institutionId);

    boolean existsByDepartmentIdAndFiscalYear(Long departmentId, Integer fiscalYear);
}
