package com.labresource.repository;

import com.labresource.entity.Equipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Optional<Equipment> findByEquipmentCode(String equipmentCode);

    boolean existsByEquipmentCode(String equipmentCode);

    List<Equipment> findByDepartment_DepartmentId(Long departmentId);

    List<Equipment> findByInstitution_InstitutionId(Long institutionId);

    List<Equipment> findByLab_LabId(Long labId);

    long countByStatus(String status);

    @Query("SELECT COUNT(e) FROM Equipment e WHERE e.lab.labId = :labId")
    long countByLabId(@Param("labId") Long labId);

    @Query("SELECT DISTINCT e.manufacturer FROM Equipment e WHERE e.manufacturer IS NOT NULL ORDER BY e.manufacturer")
    List<String> findDistinctManufacturers();

    @Query("SELECT DISTINCT e.category FROM Equipment e WHERE e.category IS NOT NULL AND e.category <> '' ORDER BY e.category")
    List<String> findDistinctCategories();

    // Raw comma-separated tag strings — split and deduped in the service layer
    @Query("SELECT e.tags FROM Equipment e WHERE e.tags IS NOT NULL AND e.tags <> ''")
    List<String> findAllTagStrings();

    // One row per category: [category, COUNT] — dashboard inventory-by-category chart
    @Query("SELECT e.category, COUNT(e) FROM Equipment e GROUP BY e.category ORDER BY COUNT(e) DESC")
    List<Object[]> countByCategory();

    /** Every asset filed under a category — used to rename, merge or reassign a category. */
    List<Equipment> findByCategoryIgnoreCase(String category);

    /**
     * Assets carrying a given tag. Matches the comma-separated list exactly the same
     * way {@link #searchEquipmentPageable} does; {@code tag} must be lowercase & trimmed.
     */
    @Query("SELECT e FROM Equipment e WHERE e.tags IS NOT NULL AND " +
           "LOWER(CONCAT(',', e.tags, ',')) LIKE CONCAT('%,', :tag, ',%')")
    List<Equipment> findByTag(@Param("tag") String tag);

    @Query("SELECT e FROM Equipment e WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.equipmentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.serialNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(e.tags) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR :category = '' OR e.category = :category) " +
           "AND (:labId IS NULL OR e.lab.labId = :labId) " +
           "AND (:departmentId IS NULL OR e.department.departmentId = :departmentId) " +
           "AND (:status IS NULL OR :status = '' OR e.status = :status) " +
           "AND (:manufacturer IS NULL OR :manufacturer = '' OR e.manufacturer = :manufacturer) " +
           // Exact tag match against the comma-separated list; :tag must be lowercase & trimmed
           "AND (:tag IS NULL OR :tag = '' OR " +
           " LOWER(CONCAT(',', e.tags, ',')) LIKE CONCAT('%,', :tag, ',%'))")
    Page<Equipment> searchEquipmentPageable(
            @Param("search") String search,
            @Param("category") String category,
            @Param("labId") Long labId,
            @Param("departmentId") Long departmentId,
            @Param("status") String status,
            @Param("manufacturer") String manufacturer,
            @Param("tag") String tag,
            Pageable pageable
    );
}
