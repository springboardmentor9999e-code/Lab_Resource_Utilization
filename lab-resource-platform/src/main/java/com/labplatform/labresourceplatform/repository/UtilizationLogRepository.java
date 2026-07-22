package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.UtilizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UtilizationLogRepository extends JpaRepository<UtilizationLog, Long> {

    List<UtilizationLog> findByEquipment_EquipmentId(Long equipmentId);

    // Windowed queries filter on recordedAt (when the log was actually created)
    // rather than usageStart/usageEnd (the booking's *scheduled* slot) - see the
    // note on UtilizationLog.recordedAt and item #4 of the fixes spec. This is
    // what makes a booking completed today show up in a "last 30 days" query
    // even if it was originally scheduled outside that window.
    @Query("SELECT u FROM UtilizationLog u WHERE u.equipment.equipmentId = :equipmentId " +
           "AND u.recordedAt >= :from AND u.recordedAt <= :to")
    List<UtilizationLog> findByEquipmentAndWindow(@Param("equipmentId") Long equipmentId,
                                                   @Param("from") LocalDateTime from,
                                                   @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(u.durationMinutes), 0) FROM UtilizationLog u " +
           "WHERE u.equipment.equipmentId = :equipmentId " +
           "AND u.recordedAt >= :from AND u.recordedAt <= :to")
    Long sumUsedMinutes(@Param("equipmentId") Long equipmentId,
                         @Param("from") LocalDateTime from,
                         @Param("to") LocalDateTime to);

    @Query("SELECT u.equipment.equipmentId, u.equipment.equipmentName, COALESCE(SUM(u.durationMinutes), 0) " +
           "FROM UtilizationLog u " +
           "WHERE u.recordedAt >= :from AND u.recordedAt <= :to " +
           "GROUP BY u.equipment.equipmentId, u.equipment.equipmentName")
    List<Object[]> sumUsedMinutesGroupedByEquipment(@Param("from") LocalDateTime from,
                                                     @Param("to") LocalDateTime to);
}
