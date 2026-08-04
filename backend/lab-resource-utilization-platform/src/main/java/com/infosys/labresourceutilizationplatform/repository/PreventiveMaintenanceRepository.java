package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.PreventiveMaintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreventiveMaintenanceRepository extends JpaRepository<PreventiveMaintenance, Long> {
    List<PreventiveMaintenance> findByEquipmentId(Long equipmentId);
}
