package com.lrplatform.service;

import com.lrplatform.exception.ForbiddenException;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.Notification;
import com.lrplatform.model.entity.NotificationRetryQueue;
import com.lrplatform.model.entity.User;
import com.lrplatform.model.enums.NotificationPriority;
import com.lrplatform.model.enums.NotificationType;
import com.lrplatform.repository.NotificationRepository;
import com.lrplatform.repository.NotificationRetryQueueRepository;
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
    private final NotificationRetryQueueRepository retryQueueRepository;
    private final NotificationPreferenceService preferenceService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationSseService notificationSseService;

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

        notificationSseService.broadcast(user.getId(), saved);

        String typeName = type != null ? type.name() : "GENERAL";
        Long userId = user.getId();

        if (preferenceService.isEmailEnabled(userId, typeName) && user.getEmail() != null) {
            try {
                emailService.sendNotificationEmail(user.getEmail(), title, message, typeName);
            } catch (Exception e) {
                log.warn("Email send failed for notification {}: {}", saved.getId(), e.getMessage());
                queueRetry(saved, "EMAIL", e.getMessage());
            }
        }

        if (preferenceService.isSmsEnabled(userId, typeName) && user.getPhone() != null) {
            try {
                smsService.sendSms(user.getPhone(), title + ": " + message.replaceAll("<[^>]*>", ""));
            } catch (Exception e) {
                log.warn("SMS send failed for notification {}: {}", saved.getId(), e.getMessage());
                queueRetry(saved, "SMS", e.getMessage());
            }
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

    @Transactional
    public void retryFailedNotification(NotificationRetryQueue retry) {
        Notification notification = retry.getNotification();
        if (notification == null) {
            retry.setStatus("FAILED");
            retryQueueRepository.save(retry);
            return;
        }

        User user = notification.getUser();
        if (user == null) {
            retry.setStatus("FAILED");
            retryQueueRepository.save(retry);
            return;
        }

        try {
            if ("EMAIL".equals(retry.getChannel()) && user.getEmail() != null) {
                emailService.sendNotificationEmail(user.getEmail(), notification.getTitle(),
                        notification.getMessage(), notification.getNotificationType().name());
                retry.setStatus("COMPLETED");
            } else if ("SMS".equals(retry.getChannel()) && user.getPhone() != null) {
                smsService.sendSms(user.getPhone(), notification.getTitle() + ": " +
                        notification.getMessage().replaceAll("<[^>]*>", ""));
                retry.setStatus("COMPLETED");
            } else {
                retry.setStatus("FAILED");
            }
        } catch (Exception e) {
            int currentRetry = retry.getRetryCount() + 1;
            retry.setRetryCount(currentRetry);
            retry.setLastError(e.getMessage());
            if (currentRetry >= retry.getMaxRetries()) {
                retry.setStatus("EXPIRED");
                log.warn("Retry exhausted for notification {} channel {}: {}", notification.getId(), retry.getChannel(), e.getMessage());
            } else {
                long backoffMinutes = (long) Math.pow(2, currentRetry) * 5;
                retry.setNextRetryAt(LocalDateTime.now().plusMinutes(backoffMinutes));
                log.info("Scheduled retry {} for notification {} in {} minutes", currentRetry, notification.getId(), backoffMinutes);
            }
        }
        retryQueueRepository.save(retry);
    }

    private void queueRetry(Notification notification, String channel, String error) {
        NotificationRetryQueue retry = NotificationRetryQueue.builder()
                .notification(notification)
                .channel(channel)
                .retryCount(0)
                .maxRetries(3)
                .nextRetryAt(LocalDateTime.now().plusMinutes(5))
                .status("PENDING")
                .lastError(error)
                .build();
        retryQueueRepository.save(retry);
        log.info("Queued {} retry for notification {}", channel, notification.getId());
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
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getUser() == null || !notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You are not allowed to modify this notification");
        }
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
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (notification.getUser() == null || !notification.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You are not allowed to delete this notification");
        }
        notificationRepository.delete(notification);
    }
}
