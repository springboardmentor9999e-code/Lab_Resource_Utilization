package com.example.hello.service;

import com.example.hello.entity.Notification;
import com.example.hello.repository.NotificationRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repository;


    public List<Notification> getAllNotifications() {

        return repository.findAll(
                Sort.by(
                        Sort.Direction.DESC,
                        "createdAt"
                )
        );

    }


    public List<Notification> getNotificationsByUser(Integer userId) {

        return repository.findByUserIdOrderByCreatedAtDesc(userId);

    }
    
    public List<Notification> getNotificationsByInstitution(Integer institutionId) {

        return repository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);

    }


    public Notification saveNotification(Notification notification) {

        return repository.save(notification);

    }


    public Notification markAsRead(Integer id) {

        Notification notification =
                repository.findById(id).orElse(null);

        if (notification != null) {

            notification.setIsRead(true);

            return repository.save(notification);

        }

        return null;

    }


    public void deleteNotification(Integer id) {

        repository.deleteById(id);

    }

}