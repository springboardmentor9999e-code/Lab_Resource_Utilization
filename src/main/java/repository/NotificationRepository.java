package com.example.labresourceplatform.repository;

import com.example.labresourceplatform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByReceiverEmail(String receiverEmail);

    List<Notification> findByReceiverRole(String receiverRole);

    List<Notification> findByReceiverRoleOrReceiverEmail(String receiverRole,
                                                         String receiverEmail);
}