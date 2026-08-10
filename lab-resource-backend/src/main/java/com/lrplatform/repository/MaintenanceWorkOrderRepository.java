package com.lrplatform.repository;

import com.lrplatform.model.entity.MaintenanceWorkOrder;
import com.lrplatform.model.enums.WorkOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceWorkOrderRepository extends JpaRepository<MaintenanceWorkOrder, Long> {
    List<MaintenanceWorkOrder> findByEquipmentId(Long equipmentId);
    List<MaintenanceWorkOrder> findByAssignedToId(Long technicianId);
    List<MaintenanceWorkOrder> findByStatus(WorkOrderStatus status);

    @Query("SELECT w FROM MaintenanceWorkOrder w WHERE w.equipment.laboratory.department.id = :departmentId ORDER BY w.createdAt DESC")
    List<MaintenanceWorkOrder> findByEquipmentDepartmentId(@Param("departmentId") Long departmentId);

    long countByEquipmentIdAndStatus(Long equipmentId, WorkOrderStatus status);

    @Query("SELECT COUNT(w) FROM MaintenanceWorkOrder w WHERE w.equipment.laboratory.department.id = :departmentId")
    Long countByEquipmentLaboratoryDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(w) FROM MaintenanceWorkOrder w WHERE w.equipment.laboratory.department.institution.id = :institutionId")
    Long countByEquipmentLaboratoryDepartmentInstitutionId(@Param("institutionId") Long institutionId);
}
