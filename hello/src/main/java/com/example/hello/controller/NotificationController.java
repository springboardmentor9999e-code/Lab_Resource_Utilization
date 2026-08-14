package com.example.hello.controller;

import com.example.hello.entity.Notification;
import com.example.hello.entity.User;
import com.example.hello.repository.UserRepository;
import com.example.hello.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @Autowired
    private UserRepository userRepository;


    // ============================================================
    // GET NOTIFICATIONS FOR CURRENTLY LOGGED-IN USER
    // ============================================================

    @GetMapping
    public List<Notification> getMyNotifications(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // IMPORTANT:
        // Get notifications using USER ID,
        // not institution ID.
        return service.getNotificationsByUser(
                user.getUserId()
        );
    }


    // ============================================================
    // CREATE NOTIFICATION
    // ============================================================

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification) {

        return service.saveNotification(notification);
    }


    // ============================================================
    // MARK AS READ
    // ============================================================

    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Integer id) {

        return service.markAsRead(id);
    }


    // ============================================================
    // DELETE NOTIFICATION
    // ============================================================

    @DeleteMapping("/{id}")
    public void deleteNotification(
            @PathVariable Integer id) {

        service.deleteNotification(id);
    }
}