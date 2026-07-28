package com.lrplatform.repository;

import com.lrplatform.model.entity.BookingWaitlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingWaitlistRepository extends JpaRepository<BookingWaitlist, Long> {
    List<BookingWaitlist> findByEquipmentIdAndActiveTrueOrderByPositionAsc(Long equipmentId);
    Optional<BookingWaitlist> findByEquipmentIdAndUserIdAndActiveTrue(Long equipmentId, Long userId);
    Long countByEquipmentIdAndActiveTrue(Long equipmentId);
}
