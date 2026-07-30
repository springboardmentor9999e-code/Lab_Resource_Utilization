package com.rems.repository;

import com.rems.entity.UtilizationMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilizationMetricRepository extends JpaRepository<UtilizationMetric, Long> {
    Optional<UtilizationMetric> findByEquipmentEquipmentIdAndDate(Long equipmentId, LocalDate date);
    List<UtilizationMetric> findByEquipmentEquipmentIdAndDateBetweenOrderByDateAsc(Long equipmentId, LocalDate start, LocalDate end);
    List<UtilizationMetric> findByEquipmentDepartmentDepartmentIdAndDateBetween(Long departmentId, LocalDate start, LocalDate end);
}
