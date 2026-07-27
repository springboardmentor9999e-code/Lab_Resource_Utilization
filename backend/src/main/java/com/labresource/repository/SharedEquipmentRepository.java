package com.labresource.repository;

import com.labresource.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Read-only discovery queries for the Inter-Institution Sharing module.
 * Kept separate from EquipmentRepository so the sharing module owns its
 * own query surface without touching the inventory module's repository.
 */
@Repository
public interface SharedEquipmentRepository extends JpaRepository<Equipment, Long> {

    @Query("SELECT e FROM Equipment e " +
           "WHERE e.isShareable = true " +
           "AND e.status = 'AVAILABLE' " +
           "AND e.institution IS NOT NULL " +
           "AND e.institution.institutionId <> :institutionId " +
           // CAST is required: :search only appears inside IS NULL and CONCAT, so Postgres
           // binds a null with no inferable type (bytea) and lower() then has no overload.
           "AND (CAST(:search AS string) IS NULL " +
           "     OR LOWER(e.equipmentName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(e.equipmentCode) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(e.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (CAST(:category AS string) IS NULL OR e.category = :category) " +
           "ORDER BY e.equipmentName ASC")
    List<Equipment> findShareableForInstitution(
            @Param("institutionId") Long institutionId,
            @Param("search") String search,
            @Param("category") String category
    );
}
