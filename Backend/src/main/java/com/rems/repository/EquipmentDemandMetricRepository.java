package com.rems.repository;

import com.rems.entity.EquipmentDemandMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentDemandMetricRepository extends JpaRepository<EquipmentDemandMetric, Long> {
    Optional<EquipmentDemandMetric> findByEquipmentEquipmentIdAndPeriodStartAndPeriodEndAndPeriodType(
            Long equipmentId, LocalDate start, LocalDate end, String periodType);
    List<EquipmentDemandMetric> findByEquipmentInstitutionInstitutionIdAndPeriodTypeOrderByDemandScoreDesc(
            Long institutionId, String periodType);
    List<EquipmentDemandMetric> findByPeriodType(String periodType);
    List<EquipmentDemandMetric> findByEquipmentDepartmentDepartmentIdAndPeriodType(Long departmentId, String periodType);
    Optional<EquipmentDemandMetric> findTopByEquipmentEquipmentIdAndPeriodTypeOrderByPeriodEndDesc(Long equipmentId, String periodType);
}
