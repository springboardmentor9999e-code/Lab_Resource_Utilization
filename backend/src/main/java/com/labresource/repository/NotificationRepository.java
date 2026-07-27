package com.labresource.repository;

import com.labresource.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByUser_UserIdOrderByCreatedAtDesc(Long userId);

    long countByUser_UserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllRead(@Param("userId") Long userId);

    // Dedup guard: has this user already received a notification of this type whose
    // message contains the given marker since the cutoff? Prevents daily re-alerting.
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.user.userId = :userId " +
           "AND n.type = :type AND n.message LIKE CONCAT('%', :marker, '%') " +
           "AND n.createdAt >= :since")
    boolean existsRecentForUser(@Param("userId") Long userId,
                                @Param("type") String type,
                                @Param("marker") String marker,
                                @Param("since") java.time.LocalDateTime since);
}
