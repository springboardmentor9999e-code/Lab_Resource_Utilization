package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.Notification;
import com.infosys.labresourceutilizationplatform.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public void sendNotification(Long userId, String roleName, Long institutionId, String title, String message, String category, String priority) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setRoleName(roleName);
        n.setInstitutionId(institutionId);
        n.setTitle(title);
        n.setMessage(message);
        n.setCategory(category);
        n.setPriority(priority != null ? priority : "Low");
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }

    public void sendNotification(Long userId, String roleName, Long institutionId, String title, String message, String category) {
        sendNotification(userId, roleName, institutionId, title, message, category, "Low");
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
                    return "BOOKING".equals(n.getCategory()) || "EQUIPMENT".equals(n.getCategory());

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
