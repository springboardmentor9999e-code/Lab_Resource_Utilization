package com.lrplatform.repository;

import com.lrplatform.model.entity.CalibrationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalibrationRecordRepository extends JpaRepository<CalibrationRecord, Long> {
    List<CalibrationRecord> findByEquipmentIdOrderByCalibrationDateDesc(Long equipmentId);
}
