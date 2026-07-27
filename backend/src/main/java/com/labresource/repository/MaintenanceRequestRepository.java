package com.labresource.repository;

import com.labresource.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findAllByOrderByCreatedAtDesc();

    List<MaintenanceRequest> findByRequestedBy_UserIdOrderByCreatedAtDesc(Long userId);

    List<MaintenanceRequest> findByAssignedTo_UserIdOrderByCreatedAtDesc(Long userId);

    List<MaintenanceRequest> findByEquipment_EquipmentIdOrderByCreatedAtDesc(Long equipmentId);

    long countByStatus(String status);

    long countByStatusIn(List<String> statuses);

    @Query("SELECT COALESCE(SUM(m.downtimeMinutes), 0) FROM MaintenanceRequest m " +
           "WHERE m.completedAt >= :since AND m.downtimeMinutes IS NOT NULL")
    long sumDowntimeMinutesSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceRequest m " +
           "WHERE m.status = 'COMPLETED' AND m.completedAt >= :since AND m.cost IS NOT NULL")
    BigDecimal sumCompletedCostSince(@Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceRequest m " +
           "WHERE m.status = 'COMPLETED' AND m.equipment.equipmentId = :equipmentId " +
           "AND m.completedAt >= :since AND m.cost IS NOT NULL")
    BigDecimal sumCompletedCostForEquipmentSince(@Param("equipmentId") Long equipmentId,
                                                 @Param("since") LocalDateTime since);

    long countByEquipment_EquipmentIdAndStatusIn(Long equipmentId, List<String> statuses);
}
