package com.example.backend.controller;

import com.example.backend.entity.Notification;
import com.example.backend.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return service.getAllNotifications();
    }

    @GetMapping("/{id}")
    public Notification getNotificationById(@PathVariable Long id) {
        return service.getNotificationById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable Integer userId) {
        return service.getNotificationsByUserId(userId);
    }

    @PostMapping
    public Notification saveNotification(@RequestBody Notification notification) {
        return service.saveNotification(notification);
    }

    @PutMapping("/{id}")
    public Notification updateNotification(@PathVariable Long id,
                                           @RequestBody Notification notification) {
        return service.updateNotification(id, notification);
    }

    @DeleteMapping("/{id}")
    public String deleteNotification(@PathVariable Long id) {
        service.deleteNotification(id);
        return "Notification deleted successfully";
    }
}