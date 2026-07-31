package com.project.Lab.Resource.Utilization.Platform.repository;

import com.project.Lab.Resource.Utilization.Platform.entity.Waitlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<Waitlist, Integer> {

    List<Waitlist> findByUserId(Integer userId);

    List<Waitlist> findByEquipmentId(Integer equipmentId);

    List<Waitlist> findByStatus(String status);

    boolean existsByEquipmentIdAndUserId(Integer equipmentId, Integer userId);

    Optional<Waitlist> findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(
            Integer equipmentId,
            String status
    );
}