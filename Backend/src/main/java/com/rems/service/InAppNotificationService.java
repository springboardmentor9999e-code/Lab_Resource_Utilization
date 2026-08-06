package com.rems.service;

import com.rems.dto.InAppNotificationResponse;
import com.rems.entity.InAppNotification;
import com.rems.entity.User;
import com.rems.enums.NotificationType;
import com.rems.exception.ApiException;
import com.rems.repository.InAppNotificationRepository;
import com.rems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InAppNotificationService {

    private final InAppNotificationRepository inAppNotificationRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public InAppNotification createNotification(User recipient, String title, String message, NotificationType type, Long relatedId) {
        if (recipient == null) return null;
        InAppNotification notification = InAppNotification.builder()
                .recipient(recipient)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false)
                .build();
        return inAppNotificationRepository.save(notification);
    }

    public List<InAppNotificationResponse> getUserNotifications(String userEmail, String filterType) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        List<InAppNotification> list;
        if (filterType != null && !filterType.trim().isEmpty() && !"ALL".equalsIgnoreCase(filterType)) {
            String filter = filterType.trim().toUpperCase();
            if ("SHARING".equals(filter)) {
                list = inAppNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getUserId()).stream()
                        .filter(n -> n.getType() == NotificationType.SHARING_REQUEST || 
                                     n.getType() == NotificationType.SHARING_APPROVED || 
                                     n.getType() == NotificationType.SHARING_REJECTED)
                        .toList();
            } else {
                try {
                    NotificationType typeEnum = NotificationType.valueOf(filter);
                    list = inAppNotificationRepository.findByRecipientUserIdAndTypeOrderByCreatedAtDesc(user.getUserId(), typeEnum);
                } catch (IllegalArgumentException e) {
                    list = inAppNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getUserId());
                }
            }
        } else {
            list = inAppNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getUserId());
        }

        return list.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        InAppNotification notification = inAppNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException("Notification not found", HttpStatus.NOT_FOUND));

        if (!notification.getRecipient().getUserId().equals(user.getUserId())) {
            throw new ApiException("Not authorized", HttpStatus.FORBIDDEN);
        }

        notification.setIsRead(true);
        inAppNotificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        List<InAppNotification> list = inAppNotificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getUserId());
        for (InAppNotification notif : list) {
            if (!Boolean.TRUE.equals(notif.getIsRead())) {
                notif.setIsRead(true);
                inAppNotificationRepository.save(notif);
            }
        }
    }

    private InAppNotificationResponse toResponse(InAppNotification notification) {
        return InAppNotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .relatedId(notification.getRelatedId())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
