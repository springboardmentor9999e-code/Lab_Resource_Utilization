package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Notification;
import com.infosys.labresourceutilizationplatform.entity.User;
import com.infosys.labresourceutilizationplatform.repository.NotificationRepository;
import com.infosys.labresourceutilizationplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private SmsNotificationService smsNotificationService;

    public void sendNotification(Long userId, String roleName, Long institutionId, String title, String message, String category, String priority) {
        sendNotification(userId, roleName, institutionId, title, message, category, priority, "ALL");
    }

    public void sendNotification(Long userId, String roleName, Long institutionId, String title, String message, String category) {
        sendNotification(userId, roleName, institutionId, title, message, category, "Low", "ALL");
    }

    public void sendNotification(Long userId, String roleName, Long institutionId, String title, String message, String category, String priority, String channel) {
        // 1. Create and save In-App notification record
        Notification n = new Notification();
        n.setUserId(userId);
        n.setRoleName(roleName);
        n.setInstitutionId(institutionId);
        n.setTitle(title);
        n.setMessage(message);
        n.setCategory(category);
        n.setPriority(priority != null ? priority : "Low");
        n.setChannel(channel != null ? channel : "ALL");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        n.setSentAt(LocalDateTime.now());
        n.setDeliveryStatus("SENT");

        try {
            notificationRepository.save(n);
        } catch (Exception ex) {
            log.error("[NOTIFICATION REPO FAILURE] Could not persist in-app notification: {}", ex.getMessage());
        }

        // 2. Resolve target users for external channels (Email & SMS)
        List<User> targetUsers = new ArrayList<>();
        if (userId != null) {
            userRepository.findById(userId.intValue()).ifPresent(targetUsers::add);
        } else if (roleName != null) {
            List<User> allUsers = userRepository.findAll();
            for (User u : allUsers) {
                if (u.getRole() != null && roleName.equalsIgnoreCase(u.getRole().getRoleName())) {
                    if (institutionId == null || (u.getInstitutionId() != null && u.getInstitutionId().equals(institutionId.intValue()))) {
                        targetUsers.add(u);
                    }
                }
            }
        }

        // 3. Dispatch Email & SMS asynchronously to all target users
        boolean shouldEmail = "ALL".equalsIgnoreCase(channel) || "EMAIL".equalsIgnoreCase(channel);
        boolean shouldSms = "ALL".equalsIgnoreCase(channel) || "SMS".equalsIgnoreCase(channel);

        for (User user : targetUsers) {
            String userRole = user.getRole() != null ? user.getRole().getRoleName() : null;
            Long uIdVal = user.getUserId() != null ? user.getUserId().longValue() : null;

            if (userId == null && !isCategoryAllowedForRole(userRole, category, uIdVal, userId)) {
                log.info("[NOTIFICATION FILTER] Blocked category '{}' notification from dispatch to user {} (Role: {})", 
                        category, user.getEmail(), userRole);
                continue;
            }

            if (shouldEmail && user.getEmail() != null && !user.getEmail().trim().isEmpty()) {
                try {
                    emailNotificationService.sendEmailAsync(user.getEmail(), title, message);
                } catch (Exception ex) {
                    log.warn("[EMAIL ASYNC TRIGGER ERROR] Error queuing email for {}: {}", user.getEmail(), ex.getMessage());
                }
            }

            if (shouldSms && user.getPhone() != null && !user.getPhone().trim().isEmpty()) {
                try {
                    smsNotificationService.sendSmsAsync(user.getPhone(), title + ": " + message);
                } catch (Exception ex) {
                    log.warn("[SMS ASYNC TRIGGER ERROR] Error queuing SMS for {}: {}", user.getPhone(), ex.getMessage());
                }
            }
        }
    }

    private boolean isCategoryAllowedForRole(String roleName, String category, Long userId, Long targetUserId) {
        if (roleName == null) return true;
        switch (roleName.toUpperCase()) {
            case "STUDENT":
            case "RESEARCHER":
                return "BOOKING".equals(category) || "EQUIPMENT".equals(category) || "SYSTEM".equals(category);

            case "LAB_TECHNICIAN":
                if ("BOOKING".equals(category)) {
                    return targetUserId != null && targetUserId.equals(userId);
                }
                return "MAINTENANCE".equals(category) || 
                       "CALIBRATION".equals(category) || 
                       "LICENSE_RENEWAL".equals(category) || 
                       "CERTIFICATE_RENEWAL".equals(category);

            case "LAB_MANAGER":
                if ("BOOKING".equals(category)) {
                    return (targetUserId != null && targetUserId.equals(userId)) || "LAB_MANAGER".equalsIgnoreCase(roleName);
                }
                return "MAINTENANCE".equals(category) || 
                       "CALIBRATION".equals(category) || 
                       "LICENSE_RENEWAL".equals(category) || 
                       "SYSTEM".equals(category);

            case "DEPARTMENT_HEAD":
                return "MAINTENANCE".equals(category) || 
                       "CALIBRATION".equals(category) || 
                       "LICENSE_RENEWAL".equals(category) || 
                       "EQUIPMENT".equals(category) || 
                       "SYSTEM".equals(category);

            case "INSTITUTION_ADMIN":
                return "SYSTEM".equals(category) || 
                       "BOOKING".equals(category) || 
                       "MAINTENANCE".equals(category) || 
                       "CALIBRATION".equals(category) || 
                       "LICENSE_RENEWAL".equals(category) || 
                       "CERTIFICATE_RENEWAL".equals(category);

            case "SYSTEM_ADMIN":
                return true;

            default:
                return true;
        }
    }

    public List<Notification> getUserNotifications(Long userId, String roleName, Long institutionId) {
        List<Notification> rawList = notificationRepository.findUserNotifications(userId, roleName, institutionId);
        if (roleName == null) {
            return rawList;
        }

        return rawList.stream().filter(n -> {
            switch (roleName) {
                case "STUDENT":
                case "RESEARCHER":
                    return "BOOKING".equals(n.getCategory()) || "EQUIPMENT".equals(n.getCategory()) || "SYSTEM".equals(n.getCategory());

                case "LAB_TECHNICIAN":
                    if ("BOOKING".equals(n.getCategory())) {
                        return n.getUserId() != null && n.getUserId().equals(userId);
                    }
                    return "MAINTENANCE".equals(n.getCategory()) || 
                           "CALIBRATION".equals(n.getCategory()) || 
                           "LICENSE_RENEWAL".equals(n.getCategory()) || 
                           "CERTIFICATE_RENEWAL".equals(n.getCategory());

                case "LAB_MANAGER":
                    if ("BOOKING".equals(n.getCategory())) {
                        return (n.getUserId() != null && n.getUserId().equals(userId)) ||
                               (n.getRoleName() != null && "LAB_MANAGER".equals(n.getRoleName()));
                    }
                    return "MAINTENANCE".equals(n.getCategory()) || 
                           "CALIBRATION".equals(n.getCategory()) || 
                           "LICENSE_RENEWAL".equals(n.getCategory()) || 
                           "SYSTEM".equals(n.getCategory());

                case "DEPARTMENT_HEAD":
                    return "MAINTENANCE".equals(n.getCategory()) || 
                           "CALIBRATION".equals(n.getCategory()) || 
                           "LICENSE_RENEWAL".equals(n.getCategory()) || 
                           "EQUIPMENT".equals(n.getCategory()) || 
                           "SYSTEM".equals(n.getCategory());

                case "INSTITUTION_ADMIN":
                    return "SYSTEM".equals(n.getCategory()) || 
                           "BOOKING".equals(n.getCategory()) || 
                           "MAINTENANCE".equals(n.getCategory()) || 
                           "CALIBRATION".equals(n.getCategory()) || 
                           "LICENSE_RENEWAL".equals(n.getCategory()) || 
                           "CERTIFICATE_RENEWAL".equals(n.getCategory());

                case "SYSTEM_ADMIN":
                    return true;

                default:
                    return true;
            }
        }).toList();
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId, String roleName, Long institutionId) {
        List<Notification> unread = notificationRepository.findUserNotifications(userId, roleName, institutionId);
        for (Notification n : unread) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
    }

    public boolean hasNotificationBeenSentToday(String title, String fragment) {
        return notificationRepository.existsNotification(title, fragment, LocalDateTime.now().minusDays(1));
    }
}
