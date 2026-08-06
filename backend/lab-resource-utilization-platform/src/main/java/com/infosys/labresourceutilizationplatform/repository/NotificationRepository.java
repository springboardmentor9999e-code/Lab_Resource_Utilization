package com.infosys.labresourceutilizationplatform.repository;

import com.infosys.labresourceutilizationplatform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE " +
           "(n.userId = :userId) OR " +
           "(n.roleName = :roleName AND (n.institutionId = :institutionId OR n.institutionId IS NULL)) OR " +
           "(n.userId IS NULL AND n.roleName IS NULL AND (n.institutionId = :institutionId OR n.institutionId IS NULL)) " +
           "ORDER BY n.createdAt DESC")
    List<Notification> findUserNotifications(@Param("userId") Long userId,
                                             @Param("roleName") String roleName,
                                             @Param("institutionId") Long institutionId);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.title = :title AND n.message LIKE %:fragment% AND n.createdAt >= :since")
    boolean existsNotification(@Param("title") String title, @Param("fragment") String fragment, @Param("since") java.time.LocalDateTime since);
}
