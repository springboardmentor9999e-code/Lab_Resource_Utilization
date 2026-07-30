package com.rems.repository;

import com.rems.entity.Equipment;
import com.rems.enums.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    @Query("SELECT e FROM Equipment e WHERE " +
           "(cast(:name as string) IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', cast(:name as string), '%'))) AND " +
           "(:institutionId IS NULL OR e.institution.institutionId = :institutionId) AND " +
           "(:departmentId IS NULL OR e.department.departmentId = :departmentId) AND " +
           "(:labId IS NULL OR e.lab.labId = :labId) AND " +
           "(:status IS NULL OR e.status = :status)")
    List<Equipment> searchEquipment(@Param("name") String name,
                                    @Param("institutionId") Long institutionId,
                                    @Param("departmentId") Long departmentId,
                                    @Param("labId") Long labId,
                                    @Param("status") EquipmentStatus status);
}
