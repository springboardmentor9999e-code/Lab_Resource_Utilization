package com.labresource.backend.repository;

import com.labresource.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Transactional
@Modifying
@Query("""
UPDATE Notification n
SET n.isRead = true
WHERE n.user.userId = :userId
AND n.isRead = false
""")
void markAllAsRead(Long userId);

    @Transactional
@Modifying
@Query("""
DELETE FROM Notification n
WHERE n.user.userId = :userId
AND n.isRead = true
""")
void deleteAllRead(Long userId);

    long countByUserUserIdAndIsReadFalse(Long userId);
    List<Notification> findByUserUserId(Long userId);
    List<Notification> findByUserUserIdAndIsReadFalse(Long userId);

    List<Notification> findByUserUserIdAndIsReadTrue(Long userId);

}