package com.labresource.service.impl;

import com.labresource.dto.response.NotificationResponse;
import com.labresource.entity.AppUser;
import com.labresource.entity.Notification;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Central notification hub. Every domain module routes its alerts through here, so the channel
 * policy lives in one place instead of being re-decided at each call site.
 *
 * <p>Three escalation levels:
 * <ul>
 *   <li>{@link #notifyInApp} — bell only, for FYI events.
 *   <li>{@link #notify} — bell + email. The default.
 *   <li>{@link #notifyUrgent} — bell + email + SMS + push, for alerts that lose their value if
 *       not seen within hours (expiring waitlist claim, tomorrow's booking, overdue calibration).
 * </ul>
 *
 * <p>SMS and push are opt-out per user. Every channel is best-effort: a delivery failure is
 * logged, never thrown, so a notification cannot roll back the transaction that triggered it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushNotificationService;

    /** In-app only. Never throws — notifications must not break business flows. */
    @Transactional
    public void notifyInApp(AppUser user, String type, String title, String message, String link) {
        try {
            notificationRepository.save(Notification.builder()
                    .user(user)
                    .type(type)
                    .title(title)
                    .message(message)
                    .link(link)
                    .build());
        } catch (Exception ex) {
            log.error("Failed to store notification for {}: {}", user.getUsername(), ex.getMessage());
        }
    }

    /** In-app + email (email is async and never throws). */
    @Transactional
    public void notify(AppUser user, String type, String title, String message, String link) {
        notifyInApp(user, type, title, message, link);
        sendEmail(user, title, message);
    }

    /** SMS text derived from title + message. Use the overload when that reads badly on a phone. */
    @Transactional
    public void notifyUrgent(AppUser user, String type, String title, String message, String link) {
        notifyUrgent(user, type, title, message, link, title + ": " + message);
    }

    /**
     * In-app + email + SMS + push.
     *
     * @param smsText compact wording for SMS and the push body — SMS bills per segment and the
     *                OS truncates push bodies, so the long-form {@code message} rarely suits both
     */
    @Transactional
    public void notifyUrgent(AppUser user, String type, String title, String message,
                             String link, String smsText) {
        notifyInApp(user, type, title, message, link);
        sendEmail(user, title, message);

        if (isEnabled(user.getSmsNotificationsEnabled())) {
            smsService.sendSms(user.getPhone(), smsText);
        }
        if (isEnabled(user.getPushNotificationsEnabled())) {
            pushNotificationService.sendToUser(user, title, smsText, link);
        }
    }

    private void sendEmail(AppUser user, String title, String message) {
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendNotificationEmail(user.getEmail(),
                    "Lab Resource Platform — " + title, message);
        }
    }

    /** Opt-out semantics: only an explicit false disables a channel. */
    private boolean isEnabled(Boolean preference) {
        return !Boolean.FALSE.equals(preference);
    }

    // ------------------------------------------------------------------
    // Channel preferences & device registration
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Map<String, Object> getPreferences(String username) {
        AppUser user = requireUser(username);
        Map<String, Object> prefs = new LinkedHashMap<>();
        prefs.put("smsEnabled", isEnabled(user.getSmsNotificationsEnabled()));
        prefs.put("pushEnabled", isEnabled(user.getPushNotificationsEnabled()));
        // The UI greys out the SMS toggle with an explanation when there is no number to text.
        prefs.put("phoneOnFile", user.getPhone() != null && !user.getPhone().isBlank());
        return prefs;
    }

    @Transactional
    public Map<String, Object> updatePreferences(String username, Boolean smsEnabled, Boolean pushEnabled) {
        AppUser user = requireUser(username);
        if (smsEnabled != null) {
            user.setSmsNotificationsEnabled(smsEnabled);
        }
        if (pushEnabled != null) {
            user.setPushNotificationsEnabled(pushEnabled);
        }
        appUserRepository.save(user);
        return getPreferences(username);
    }

    @Transactional
    public void registerDevice(String username, String token, String platform) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("A device token is required");
        }
        pushNotificationService.registerDevice(requireUser(username), token.trim(), platform);
    }

    @Transactional
    public void unregisterDevice(String token) {
        if (token != null && !token.isBlank()) {
            pushNotificationService.unregisterDevice(token.trim());
        }
    }

    // ------------------------------------------------------------------
    // Read APIs (current user)
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String username) {
        AppUser user = requireUser(username);
        return notificationRepository.findTop50ByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(n -> NotificationResponse.builder()
                        .notificationId(n.getNotificationId())
                        .type(n.getType())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .link(n.getLink())
                        .read(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String username) {
        AppUser user = requireUser(username);
        return notificationRepository.countByUser_UserIdAndIsReadFalse(user.getUserId());
    }

    @Transactional
    public void markRead(Long notificationId, String username) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUser().getUsername().equals(username)) {
            throw new RuntimeException("You can only mark your own notifications as read");
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public int markAllRead(String username) {
        AppUser user = requireUser(username);
        return notificationRepository.markAllRead(user.getUserId());
    }

    private AppUser requireUser(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
