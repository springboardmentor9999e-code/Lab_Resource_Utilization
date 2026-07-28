package com.lrplatform.repository;

import com.lrplatform.model.entity.ExternalBookingRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExternalBookingRequestRepository extends JpaRepository<ExternalBookingRequest, Long> {
    List<ExternalBookingRequest> findByRequestingInstitutionId(Long institutionId);
    List<ExternalBookingRequest> findByStatus(String status);

    @Query("SELECT e FROM ExternalBookingRequest e WHERE e.sharedEquipment.equipment.laboratory.department.id = :departmentId ORDER BY e.createdAt DESC")
    List<ExternalBookingRequest> findByEquipmentDepartmentId(@Param("departmentId") Long departmentId);
}
