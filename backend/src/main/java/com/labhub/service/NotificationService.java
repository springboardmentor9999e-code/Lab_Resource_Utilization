package com.labhub.service;

import com.labhub.entity.Notification;
import com.labhub.entity.User;
import com.labhub.enums.NotificationType;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    void createNotification(User user, String title, String message, NotificationType type, String actionUrl);
    List<Notification> getUserNotifications(String email);
    long getUnreadCount(String email);
    void markAsRead(UUID notificationId, String email);
    void markAllAsRead(String email);
}
