package com.lab.backend.repository;

import com.lab.backend.entity.Utilization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilizationRepository extends JpaRepository<Utilization, Long> {
    List<Utilization> findByEquipmentId(Long equipmentId);
    List<Utilization> findByDepartmentIgnoreCase(String department);
    List<Utilization> findByStatus(String status);
    List<Utilization> findByEquipmentIdAndStatus(Long equipmentId, String status);
    long countByStatus(String status);
}
