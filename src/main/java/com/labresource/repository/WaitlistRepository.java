package com.labresource.repository;

import com.labresource.entity.WaitlistEntry;
import com.labresource.entity.WaitlistStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {

    Optional<WaitlistEntry> findFirstByEquipmentIdAndStatusOrderByCreatedAtAsc(Long equipmentId, WaitlistStatus status);

    List<WaitlistEntry> findByUserEmail(String userEmail);

    boolean existsByEquipmentIdAndUserEmailAndStatus(Long equipmentId, String userEmail, WaitlistStatus status);
}