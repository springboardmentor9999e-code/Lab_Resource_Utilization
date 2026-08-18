package com.lab.backend.repository;

import com.lab.backend.entity.Waitlist;
import com.lab.backend.enums.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaitlistRepository extends JpaRepository<Waitlist, Long> {
    
    @Query("SELECT w FROM Waitlist w WHERE w.equipment.id = ?1 AND w.status = ?2 " +
           "ORDER BY w.priority DESC, w.requestDate ASC")
    List<Waitlist> findByResourceAndStatusOrderedByPriority(Long resourceId, WaitlistStatus status);
    
    @Query("SELECT COUNT(w) FROM Waitlist w WHERE w.equipment.id = ?1 AND w.status = ?2")
    Integer countByResourceAndStatus(Long resourceId, WaitlistStatus status);
    
    Optional<Waitlist> findByEquipmentIdAndUserId(Long equipmentId, Long userId);
    
    @Query("SELECT w FROM Waitlist w WHERE w.status = ?1 ORDER BY w.priority DESC, w.requestDate ASC")
    List<Waitlist> findByStatusOrderedByPriority(WaitlistStatus status);
    
    List<Waitlist> findByUserId(Long userId);
    List<Waitlist> findByEquipmentId(Long equipmentId);
}
