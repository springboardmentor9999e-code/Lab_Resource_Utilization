package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Notification;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import com.infosys.labresourceutilizationplatform.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        Long institutionId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;

        List<Notification> list = notificationService.getUserNotifications(userId, roleName, institutionId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        Long institutionId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;

        List<Notification> list = notificationService.getUserNotifications(userId, roleName, institutionId);
        long count = list.stream().filter(n -> !n.isRead()).count();

        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getUserId() != null ? Long.valueOf(user.getUserId()) : null;
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        Long institutionId = user.getInstitutionId() != null ? Long.valueOf(user.getInstitutionId()) : null;

        notificationService.markAllAsRead(userId, roleName, institutionId);
        return ResponseEntity.ok().build();
    }
}
