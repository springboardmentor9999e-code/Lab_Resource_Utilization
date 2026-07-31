package com.lrplatform.repository;

import com.lrplatform.model.entity.NotificationRetryQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRetryQueueRepository extends JpaRepository<NotificationRetryQueue, Long> {

    @Query("SELECT r FROM NotificationRetryQueue r WHERE r.status = 'PENDING' AND r.nextRetryAt <= :now")
    List<NotificationRetryQueue> findPendingRetries(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(r) FROM NotificationRetryQueue r WHERE r.status = 'PENDING'")
    Long countPending();

    @Modifying
    @Transactional
    @Query("UPDATE NotificationRetryQueue r SET r.status = 'EXPIRED' WHERE r.status = 'PENDING' AND r.retryCount >= r.maxRetries")
    int markExpiredRetries();
}
