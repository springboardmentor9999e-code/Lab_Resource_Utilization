package com.labresource.repository;

import com.labresource.entity.EquipmentCalibration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EquipmentCalibrationRepository extends JpaRepository<EquipmentCalibration, Long> {

    List<EquipmentCalibration> findAllByOrderByNextDueDateAsc();

    List<EquipmentCalibration> findByEquipment_EquipmentIdOrderByCalibrationDateDesc(Long equipmentId);

    // Latest calibration per equipment expiring within the window (or already overdue)
    @Query("SELECT c FROM EquipmentCalibration c JOIN FETCH c.equipment " +
           "WHERE c.nextDueDate <= :until ORDER BY c.nextDueDate ASC")
    List<EquipmentCalibration> findExpiringUntil(@Param("until") LocalDate until);

    long countByNextDueDateBefore(LocalDate date);

    List<EquipmentCalibration> findByReminderSentFalseAndNextDueDateLessThanEqual(LocalDate date);
}
