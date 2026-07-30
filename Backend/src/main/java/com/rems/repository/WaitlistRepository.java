package com.rems.repository;

import com.rems.entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByEquipmentEquipmentIdAndCreatedAtBetween(Long equipmentId, Instant start, Instant end);
    List<WaitlistEntry> findByEquipmentEquipmentId(Long equipmentId);
    List<WaitlistEntry> findByEquipmentEquipmentIdAndStatus(Long equipmentId, String status);
    List<WaitlistEntry> findByEquipmentEquipmentIdAndStatusOrderByCreatedAtAsc(Long equipmentId, String status);
    List<WaitlistEntry> findByEquipmentEquipmentIdAndStatusIn(Long equipmentId, List<String> statuses);
    List<WaitlistEntry> findByUserEmailOrderByCreatedAtDesc(String email);
    List<WaitlistEntry> findByUserEmailAndStatus(String email, String status);
    List<WaitlistEntry> findByStatus(String status);
}
