package com.labresource.backend.repository;

import com.labresource.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByLaboratoryLabId(Long labId);
    long countByStatus(String status);
    long countByStatusIgnoreCase(String status);
    List<Equipment> findByLaboratoryInstitutionInstitutionId(Long institutionId);

    // Total Inventory Value
    @Query("SELECT SUM(e.cost * e.quantity) FROM Equipment e")
    Double getTotalInventoryValue();

    // Cost grouped by category
    @Query("""
           SELECT e.category, SUM(e.cost * e.quantity)
           FROM Equipment e
           GROUP BY e.category
           """)
    List<Object[]> getCategoryCost();

    // Top expensive equipment
    List<Equipment> findTop10ByOrderByCostDesc();

    @Query("""
        SELECT e.equipmentName, e.availableQuantity, e.quantity, e.status
        FROM Equipment e
        ORDER BY e.availableQuantity ASC
    """)
    List<Object[]> getEquipmentAvailability();
}
