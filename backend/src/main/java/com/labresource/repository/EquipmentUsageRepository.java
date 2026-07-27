package com.labresource.repository;

import com.labresource.entity.EquipmentUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentUsageRepository extends JpaRepository<EquipmentUsage, Long> {

    Optional<EquipmentUsage> findFirstByBooking_BookingIdAndEndTimeIsNullOrderByStartTimeDesc(Long bookingId);

    @Query("SELECT COALESCE(SUM(u.usageDurationMin), 0) FROM EquipmentUsage u " +
           "WHERE u.equipment.equipmentId = :equipmentId AND u.startTime >= :from AND u.usageDurationMin IS NOT NULL")
    long sumUsedMinutes(@Param("equipmentId") Long equipmentId, @Param("from") LocalDateTime from);

    // One row per equipment: [equipmentId, SUM(usageDurationMin)] — lets the
    // utilization summary fetch all totals in a single query instead of one per equipment
    @Query("SELECT u.equipment.equipmentId, COALESCE(SUM(u.usageDurationMin), 0) FROM EquipmentUsage u " +
           "WHERE u.startTime >= :from AND u.usageDurationMin IS NOT NULL " +
           "GROUP BY u.equipment.equipmentId")
    List<Object[]> sumUsedMinutesPerEquipment(@Param("from") LocalDateTime from);

    List<EquipmentUsage> findByStartTimeGreaterThanEqual(LocalDateTime from);
}
