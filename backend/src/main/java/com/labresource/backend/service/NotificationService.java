package com.labresource.backend.service;

import com.labresource.backend.entity.Notification;
import com.labresource.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Get All Notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get Notification By ID
    public Notification getNotificationById(Long id) {

        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));
    }

    // Get Notifications By User
    public List<Notification> getNotificationsByUser(Long userId) {

        return notificationRepository.findByUserUserId(userId);
    }

    // Create Notification
    // Create Notification
public Notification createNotification(Notification notification) {

    notification.setCreatedAt(LocalDateTime.now());

    if (notification.getUser() == null) {
        throw new RuntimeException("User is required");
    }

    if (notification.getIsRead() == null) {
        notification.setIsRead(false);
    }
    if (notification.getType() == null) {
        notification.setType("GENERAL");
    }

    return notificationRepository.save(notification);
}

    // Update Notification
    public Notification updateNotification(Long id,
                                           Notification notification) {

        Notification existingNotification = getNotificationById(id);

        existingNotification.setUser(notification.getUser());
        existingNotification.setTitle(notification.getTitle());
        existingNotification.setMessage(notification.getMessage());

        if (notification.getIsRead() != null) {
            existingNotification.setIsRead(notification.getIsRead());
        }

        return notificationRepository.save(existingNotification);
    }

    // Mark Notification as Read
    public Notification markAsRead(Long id) {

        Notification notification = getNotificationById(id);

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    // Delete Notification
    public void deleteNotification(Long id) {

        Notification notification = getNotificationById(id);

        notificationRepository.delete(notification);
    }

    @Transactional
public void markAllAsRead(Long userId) {

    notificationRepository.markAllAsRead(userId);

}

@Transactional
public void deleteAllRead(Long userId) {

    notificationRepository.deleteAllRead(userId);

}

    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByUserUserIdAndIsReadFalse(userId);

    }
}