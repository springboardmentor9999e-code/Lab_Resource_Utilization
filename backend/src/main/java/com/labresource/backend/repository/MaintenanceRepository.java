package com.labresource.backend.repository;

import com.labresource.backend.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    long countByStatus(String status);
    List<Maintenance> findByEquipmentLaboratoryInstitutionInstitutionId(Long institutionId);
}