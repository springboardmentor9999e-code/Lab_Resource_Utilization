package com.example.labresourceplatform.service;

import com.example.labresourceplatform.entity.Notification;
import com.example.labresourceplatform.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification saveNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByRole(String role) {
        return notificationRepository.findByReceiverRole(role);
    }

    public List<Notification> getNotificationsByEmail(String email) {
        return notificationRepository.findByReceiverEmail(email);
    }

    public List<Notification> getNotifications(String role, String email) {
        return notificationRepository.findByReceiverRoleOrReceiverEmail(role, email);
    }

    public void markAsRead(Long id) {

        Notification notification =
                notificationRepository.findById(id).orElseThrow();

        notification.setIsRead(true);

        notificationRepository.save(notification);
    }
}