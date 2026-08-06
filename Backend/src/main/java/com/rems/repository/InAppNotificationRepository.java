package com.rems.repository;

import com.rems.entity.InAppNotification;
import com.rems.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InAppNotificationRepository extends JpaRepository<InAppNotification, Long> {

    List<InAppNotification> findByRecipientUserIdOrderByCreatedAtDesc(Long userId);

    List<InAppNotification> findByRecipientUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    long countByRecipientUserIdAndIsReadFalse(Long userId);
}
