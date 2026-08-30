package com.example.labresourceplatform.controller;

import com.example.labresourceplatform.entity.Notification;
import com.example.labresourceplatform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/role/{role}")
    public List<Notification> getByRole(@PathVariable String role) {
        return notificationService.getNotificationsByRole(role);
    }

    @GetMapping("/email/{email}")
    public List<Notification> getByEmail(@PathVariable String email) {
        return notificationService.getNotificationsByEmail(email);
    }

    @GetMapping
    public List<Notification> getNotifications(
            @RequestParam String role,
            @RequestParam String email) {

        return notificationService.getNotifications(role, email);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }
}