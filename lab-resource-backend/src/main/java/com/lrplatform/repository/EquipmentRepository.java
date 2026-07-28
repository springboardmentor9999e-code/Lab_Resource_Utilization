package com.lrplatform.repository;

import com.lrplatform.model.entity.Equipment;
import com.lrplatform.model.enums.EquipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    Boolean existsByEquipmentCode(String code);
    long countByStatus(EquipmentStatus status);

    List<Equipment> findByLaboratoryDepartmentId(Long departmentId);

    @Query("SELECT e FROM Equipment e WHERE e.laboratory.department.institution.id = :institutionId")
    List<Equipment> findByLaboratoryDepartmentInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.laboratory.department.id = :departmentId")
    Long countByLaboratoryDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.laboratory.department.id = :departmentId AND e.status = 'IN_USE'")
    Long countInUseByLaboratoryDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.laboratory.department.institution.id = :institutionId")
    Long countByLaboratoryDepartmentInstitutionId(@Param("institutionId") Long institutionId);

    @Query("SELECT e.status, COUNT(e) FROM Equipment e WHERE e.laboratory.department.id = :departmentId GROUP BY e.status")
    List<Object[]> countByStatusGroupedByDepartmentId(@Param("departmentId") Long departmentId);

    @Query("SELECT e.status, COUNT(e) FROM Equipment e WHERE e.laboratory.department.institution.id = :institutionId GROUP BY e.status")
    List<Object[]> countByStatusGroupedByInstitutionId(@Param("institutionId") Long institutionId);

    @Query(value = "SELECT e.* FROM equipment e WHERE " +
           "(:name IS NULL OR LOWER(e.equipment_name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:categoryId IS NULL OR e.category_id = :categoryId) " +
           "AND (:laboratoryId IS NULL OR e.laboratory_id = :laboratoryId) " +
           "AND (:status IS NULL OR e.status = :status)",
           nativeQuery = true)
    List<Equipment> searchEquipment(
            @Param("name") String name,
            @Param("categoryId") Long categoryId,
            @Param("laboratoryId") Long laboratoryId,
            @Param("status") String status
    );

    @Query(value = "SELECT e.* FROM equipment e WHERE e.category_id IN :categoryIds " +
           "AND e.id NOT IN (SELECT b.equipment_id FROM bookings b WHERE b.user_id = :userId) " +
           "AND e.status = 'AVAILABLE' ORDER BY RANDOM()", nativeQuery = true)
    List<Equipment> findUnbookedByUserAndCategories(@Param("userId") Long userId, @Param("categoryIds") List<Long> categoryIds);

    @Query(value = "SELECT e.* FROM equipment e INNER JOIN bookings b ON e.id = b.equipment_id " +
           "WHERE e.status = 'AVAILABLE' GROUP BY e.id ORDER BY COUNT(b.id) DESC LIMIT :limit", nativeQuery = true)
    List<Equipment> findMostBookedEquipment(@Param("limit") int limit);
}
