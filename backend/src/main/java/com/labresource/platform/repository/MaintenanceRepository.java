package com.labresource.platform.repository;

import com.labresource.platform.entity.Maintenance;
import com.labresource.platform.entity.MaintenanceStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    long countByStatusIn(Collection<MaintenanceStatus> statuses);

    List<Maintenance> findByEquipmentId(Long equipmentId);

    List<Maintenance> findByStatus(MaintenanceStatus status);

    List<Maintenance> findByEquipmentIdAndStatus(Long equipmentId, MaintenanceStatus status);

    @Query("""
            select maintenance
            from Maintenance maintenance
            where maintenance.equipment.id = :equipmentId
                    and maintenance.status in :statuses
                    and maintenance.scheduledStartTime < :scheduledEndTime
                    and maintenance.scheduledEndTime > :scheduledStartTime
            """)
    List<Maintenance> findOverlappingActiveMaintenance(
            @Param("equipmentId") Long equipmentId,
            @Param("statuses") Collection<MaintenanceStatus> statuses,
            @Param("scheduledStartTime") LocalDateTime scheduledStartTime,
            @Param("scheduledEndTime") LocalDateTime scheduledEndTime
    );

    @Query("""
            select maintenance
            from Maintenance maintenance
            where maintenance.id <> :excludedId
                    and maintenance.equipment.id = :equipmentId
                    and maintenance.status in :statuses
                    and maintenance.scheduledStartTime < :scheduledEndTime
                    and maintenance.scheduledEndTime > :scheduledStartTime
            """)
    List<Maintenance> findOverlappingActiveMaintenanceExcludingId(
            @Param("excludedId") Long excludedId,
            @Param("equipmentId") Long equipmentId,
            @Param("statuses") Collection<MaintenanceStatus> statuses,
            @Param("scheduledStartTime") LocalDateTime scheduledStartTime,
            @Param("scheduledEndTime") LocalDateTime scheduledEndTime
    );
}
