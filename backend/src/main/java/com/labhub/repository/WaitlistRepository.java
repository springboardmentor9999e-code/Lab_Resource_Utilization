package com.labhub.repository;

import com.labhub.entity.Waitlist;
import com.labhub.enums.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, UUID> {

    List<Waitlist> findByUserIdAndStatus(UUID userId, WaitlistStatus status);

    List<Waitlist> findByEquipmentIdAndStatusOrderByPositionAsc(UUID equipmentId, WaitlistStatus status);

    @Query("SELECT COUNT(w) FROM Waitlist w WHERE w.equipment.id = :equipmentId AND w.status = 'WAITING'")
    int countWaitingByEquipmentId(@Param("equipmentId") UUID equipmentId);

    Optional<Waitlist> findByUserIdAndEquipmentIdAndStatus(UUID userId, UUID equipmentId, WaitlistStatus status);
}
