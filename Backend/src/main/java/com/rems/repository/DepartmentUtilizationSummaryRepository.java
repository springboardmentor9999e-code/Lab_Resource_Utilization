package com.rems.repository;

import com.rems.entity.DepartmentUtilizationSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentUtilizationSummaryRepository extends JpaRepository<DepartmentUtilizationSummary, Long> {
    Optional<DepartmentUtilizationSummary> findByDepartmentDepartmentIdAndDate(Long departmentId, LocalDate date);
    List<DepartmentUtilizationSummary> findByDepartmentDepartmentIdAndDateBetween(Long departmentId, LocalDate start, LocalDate end);
}
