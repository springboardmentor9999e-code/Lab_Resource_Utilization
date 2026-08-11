package com.labplatform.labresourceplatform.repository;

import com.labplatform.labresourceplatform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipient_UserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByRecipient_UserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // Used to avoid spamming the same person with a duplicate alert every time
    // the scheduled job runs (e.g. once a day) for the same underlying
    // condition - only generate a fresh one if the most recent matching
    // notification is more than a day old (or doesn't exist yet).
    Optional<Notification> findFirstByRecipient_UserIdAndTypeAndEquipment_EquipmentIdOrderByCreatedAtDesc(
            Long userId, String type, Long equipmentId);
}
