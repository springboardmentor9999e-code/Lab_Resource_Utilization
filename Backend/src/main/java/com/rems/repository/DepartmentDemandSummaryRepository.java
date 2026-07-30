package com.rems.repository;

import com.rems.entity.DepartmentDemandSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentDemandSummaryRepository extends JpaRepository<DepartmentDemandSummary, Long> {
    Optional<DepartmentDemandSummary> findByDepartmentDepartmentIdAndPeriodStartAndPeriodEndAndPeriodType(
            Long departmentId, LocalDate start, LocalDate end, String periodType);
}
