package com.lrplatform.controller;

import com.lrplatform.dto.response.ApiResponse;
import com.lrplatform.dto.response.NotificationResponse;
import com.lrplatform.exception.BadRequestException;
import com.lrplatform.security.CurrentUserUtil;
import com.lrplatform.security.SseTicketService;
import com.lrplatform.service.NotificationService;
import com.lrplatform.service.NotificationSseService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserUtil currentUserUtil;
    private final SseTicketService sseTicketService;
    private final NotificationSseService notificationSseService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId).stream().map(this::toDto).toList());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id, HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted"));
    }

    @PostMapping("/ticket")
    public ResponseEntity<Map<String, String>> createSseTicket(HttpServletRequest request) {
        Long userId = currentUserUtil.getCurrentUserId(request);
        return ResponseEntity.ok(Map.of("ticket", sseTicketService.create(userId)));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam("ticket") String ticket) {
        Long userId = sseTicketService.consume(ticket);
        if (userId == null) {
            throw new BadRequestException("Invalid or expired ticket");
        }
        return notificationSseService.subscribe(userId);
    }

    private NotificationResponse toDto(com.lrplatform.model.entity.Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .userId(n.getUser() != null ? n.getUser().getId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType() != null ? n.getNotificationType().name() : null)
                .priority(n.getPriority() != null ? n.getPriority().name() : null)
                .status(n.getStatus())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
