package com.lrplatform.service;

import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Notification;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import com.lrplatform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceService preferenceService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @SuppressWarnings("null")
    public Notification createNotification(User user, String title, String message,
                                           NotificationType type, NotificationPriority priority) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .notificationType(type)
                .priority(priority != null ? priority : NotificationPriority.MEDIUM)
                .status("UNREAD")
                .build();
        Notification saved = notificationRepository.save(Objects.requireNonNull(notification));

        String typeName = type != null ? type.name() : "GENERAL";
        Long userId = user.getId();

        if (preferenceService.isEmailEnabled(userId, typeName) && user.getEmail() != null) {
            emailService.sendNotificationEmail(user.getEmail(), title, message, typeName);
        }

        if (preferenceService.isSmsEnabled(userId, typeName) && user.getPhone() != null) {
            smsService.sendSms(user.getPhone(), title + ": " + message.replaceAll("<[^>]*>", ""));
        }

        if (preferenceService.isPushEnabled(userId, typeName)) {
            try {
                messagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/topic/notifications",
                    Map.of(
                        "id", saved.getId(),
                        "title", title,
                        "message", message.replaceAll("<[^>]*>", ""),
                        "type", typeName,
                        "priority", priority != null ? priority.name() : "MEDIUM"
                    )
                );
            } catch (Exception e) {
                log.debug("WebSocket push failed for user {}: {}", userId, e.getMessage());
            }
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        Long count = notificationRepository.countUnreadByUserId(userId);
        return count != null ? count : 0L;
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            if ("UNREAD".equals(n.getStatus())) {
                n.setStatus("READ");
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(Objects.requireNonNull(notificationId))) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notificationRepository.deleteById(Objects.requireNonNull(notificationId));
    }
}
