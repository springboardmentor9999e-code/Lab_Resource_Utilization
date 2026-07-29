package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByEquipment_EquipmentIdAndStatus(Long equipmentId, String status);

    // Maintenance records with no status set yet - a plain "= null" comparison
    // never matches NULL rows in SQL, so this needs an explicit IS NULL query
    // rather than a derived findBy...Status(equipmentId, null) call.
    @Query("SELECT m FROM Maintenance m WHERE m.equipment.equipmentId = :equipmentId AND m.status IS NULL")
    List<Maintenance> findByEquipmentIdAndStatusIsNull(@Param("equipmentId") Long equipmentId);

    // Distinct equipment ids that have at least one maintenance record, for the
    // startup reconciliation pass. Selects the id directly rather than loading
    // full Maintenance/Equipment entities and traversing the lazy association -
    // that traversal would throw LazyInitializationException outside a request
    // (no open Hibernate session), since this runs from a CommandLineRunner at
    // startup rather than from a web request.
    @Query("SELECT DISTINCT m.equipment.equipmentId FROM Maintenance m WHERE m.equipment IS NOT NULL")
    List<Long> findDistinctEquipmentIdsWithMaintenanceHistory();
}
