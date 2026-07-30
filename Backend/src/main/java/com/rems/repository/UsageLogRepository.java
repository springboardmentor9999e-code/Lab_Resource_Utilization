package com.rems.repository;

import com.rems.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    List<UsageLog> findByEquipmentEquipmentIdAndActualStartTimeBetween(Long equipmentId, Instant start, Instant end);
    List<UsageLog> findByEquipmentEquipmentId(Long equipmentId);
}
