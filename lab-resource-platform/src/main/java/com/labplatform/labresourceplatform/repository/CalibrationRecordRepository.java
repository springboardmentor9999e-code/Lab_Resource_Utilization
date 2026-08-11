package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.CalibrationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CalibrationRecordRepository extends JpaRepository<CalibrationRecord, Long> {

    List<CalibrationRecord> findByEquipment_EquipmentIdOrderByCalibratedDateDesc(Long equipmentId);

    // The most recent calibration on file for a piece of equipment - its
    // expiryDate is what determines whether that equipment is coming due.
    Optional<CalibrationRecord> findFirstByEquipment_EquipmentIdOrderByCalibratedDateDesc(Long equipmentId);

    // Renewal reminders: the latest calibration record per equipment whose
    // expiry falls within the given date window (e.g. "expiring in the next 30
    // days", or already-expired if `to` is today). Only the LATEST record per
    // equipment matters for this - an old, superseded record's expiry date is
    // irrelevant once a newer calibration has been logged.
    @Query("SELECT c FROM CalibrationRecord c WHERE c.expiryDate BETWEEN :from AND :to " +
           "AND c.calibratedDate = (" +
           "  SELECT MAX(c2.calibratedDate) FROM CalibrationRecord c2 WHERE c2.equipment = c.equipment" +
           ")")
    List<CalibrationRecord> findLatestExpiringBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
