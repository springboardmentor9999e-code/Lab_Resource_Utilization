package com.lab.backend.repository;

import com.lab.backend.entity.BookingOptimizationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingOptimizationLogRepository extends JpaRepository<BookingOptimizationLog, Long> {
    
    List<BookingOptimizationLog> findByEquipmentIdOrderByOptimizationTimestampDesc(Long equipmentId, Pageable pageable);
}
