package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {

    List<Maintenance> findByEquipmentId(Integer equipmentId);

    List<Maintenance> findByTechnicianId(Integer technicianId);

    List<Maintenance> findByReportedBy(Integer reportedBy);

    List<Maintenance> findByStatus(String status);

    List<Maintenance> findByMaintenanceType(String maintenanceType);

}