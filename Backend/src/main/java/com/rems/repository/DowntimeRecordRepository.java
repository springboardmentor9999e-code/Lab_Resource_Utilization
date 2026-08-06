package com.rems.repository;

import com.rems.entity.DowntimeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DowntimeRecordRepository extends JpaRepository<DowntimeRecord, Long> {
    List<DowntimeRecord> findByEquipmentEquipmentId(Long equipmentId);
    List<DowntimeRecord> findByEndTimeIsNull();
    List<DowntimeRecord> findByEquipmentEquipmentIdAndEndTimeIsNull(Long equipmentId);
    List<DowntimeRecord> findAllByOrderByStartTimeDesc();
}
