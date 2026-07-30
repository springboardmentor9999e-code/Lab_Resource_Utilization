package com.labhub.repository;

import com.labhub.entity.Equipment;
import com.labhub.enums.EquipmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, UUID> {

    Optional<Equipment> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);

    long countByStatus(EquipmentStatus status);

    long countByDepartmentInstitutionId(UUID instId);

    long countByStatusAndDepartmentInstitutionId(EquipmentStatus status, UUID instId);

    // Query without status filter (status IS NULL)
    @Query("""
            SELECT e FROM Equipment e
            WHERE e.isActive = true
            AND (coalesce(:search, '') = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:categoryId IS NULL OR e.category.id = :categoryId)
            AND (:departmentId IS NULL OR e.department.id = :departmentId)
            AND (:institutionId IS NULL OR e.department.institution.id = :institutionId)
            """)
    Page<Equipment> findWithFiltersNoStatus(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("departmentId") UUID departmentId,
            @Param("institutionId") UUID institutionId,
            Pageable pageable
    );

    // Query with status filter
    @Query("""
            SELECT e FROM Equipment e
            WHERE e.isActive = true
            AND (coalesce(:search, '') = '' OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))
                 OR LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:categoryId IS NULL OR e.category.id = :categoryId)
            AND e.status = :status
            AND (:departmentId IS NULL OR e.department.id = :departmentId)
            AND (:institutionId IS NULL OR e.department.institution.id = :institutionId)
            """)
    Page<Equipment> findWithFiltersWithStatus(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            @Param("status") EquipmentStatus status,
            @Param("departmentId") UUID departmentId,
            @Param("institutionId") UUID institutionId,
            Pageable pageable
    );
}

