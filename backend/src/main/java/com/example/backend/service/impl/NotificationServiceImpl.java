package com.example.backend.service.impl;

import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    public NotificationServiceImpl(NotificationRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Notification> getAllNotifications() {
        return repository.findAll();
    }

    @Override
    public Notification getNotificationById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public Notification saveNotification(Notification notification) {
        return repository.save(notification);
    }

    @Override
    public Notification updateNotification(Long id, Notification notification) {

        Notification existing = repository.findById(id).orElse(null);

        if (existing != null) {
            existing.setUserId(notification.getUserId());
            existing.setMessage(notification.getMessage());
            existing.setType(notification.getType());
            existing.setStatus(notification.getStatus());

            return repository.save(existing);
        }

        return null;
    }

    @Override
    public void deleteNotification(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Notification> getNotificationsByUserId(Integer userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}