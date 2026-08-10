package com.example.backend.service;

import com.example.backend.entity.Notification;

import java.util.List;

public interface NotificationService {

    List<Notification> getAllNotifications();

    Notification getNotificationById(Long id);

    Notification saveNotification(Notification notification);

    Notification updateNotification(Long id, Notification notification);

    void deleteNotification(Long id);

    List<Notification> getNotificationsByUserId(Integer userId);

}