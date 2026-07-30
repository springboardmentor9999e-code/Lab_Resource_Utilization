package com.labhub.controller;

import com.labhub.dto.common.ApiResponse;
import com.labhub.entity.Notification;
import com.labhub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications(Authentication auth) {
        List<Notification> notifications = notificationService.getUserNotifications(auth.getName());
        List<Map<String, Object>> result = notifications.stream().map(n -> Map.<String, Object>of(
                "id", n.getId().toString(),
                "title", n.getTitle(),
                "message", n.getMessage(),
                "type", n.getType().name(),
                "isRead", n.getIsRead(),
                "actionUrl", n.getActionUrl() != null ? n.getActionUrl() : "",
                "createdAt", n.getCreatedAt().toString()
        )).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(auth.getName());
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable UUID id, Authentication auth) {
        notificationService.markAsRead(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
}
