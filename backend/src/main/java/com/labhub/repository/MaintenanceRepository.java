package com.labhub.repository;

import com.labhub.entity.Maintenance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, UUID> {
    Page<Maintenance> findByEquipmentId(UUID equipmentId, Pageable pageable);

    @Query("SELECT m FROM Maintenance m JOIN FETCH m.equipment WHERE m.equipment.department.institution.id = :instId")
    List<Maintenance> findByEquipmentDepartmentInstitutionId(@Param("instId") UUID instId);

    @Query("SELECT m FROM Maintenance m JOIN FETCH m.equipment")
    List<Maintenance> findAllWithEquipment();
}
