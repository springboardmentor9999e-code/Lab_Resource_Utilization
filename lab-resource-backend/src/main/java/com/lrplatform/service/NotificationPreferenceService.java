package com.lrplatform.service;

import com.lrplatform.annotation.Auditable;
import com.lrplatform.dto.request.NotificationPreferenceRequest;
import com.lrplatform.dto.response.NotificationPreferenceResponse;
import com.lrplatform.exception.ResourceNotFoundException;
import com.lrplatform.model.entity.NotificationPreference;
import com.lrplatform.model.entity.User;
import com.lrplatform.repository.NotificationPreferenceRepository;
import com.lrplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final UserRepository userRepository;

    private static final String[] NOTIFICATION_TYPES = {
        "BOOKING_CREATED", "BOOKING_APPROVED", "BOOKING_REJECTED", "BOOKING_CANCELLED",
        "BOOKING_REMINDER", "MAINTENANCE_SCHEDULED", "MAINTENANCE_COMPLETED",
        "CALIBRATION_DUE", "EQUIPMENT_AVAILABLE", "WAITLIST_PROMOTED",
        "PARTNERSHIP_INVITATION", "ANNOUNCEMENT", "PASSWORD_RESET", "GENERAL"
    };

    @Transactional(readOnly = true)
    public List<NotificationPreferenceResponse> getUserPreferences(Long userId) {
        List<NotificationPreference> preferences = notificationPreferenceRepository.findByUserId(userId);
        
        // If no preferences exist, return default preferences
        if (preferences.isEmpty()) {
            return getDefaultPreferences();
        }
        
        return preferences.stream()
                .map(this::toResponse)
                .toList();
    }

    @Auditable(module = "NOTIFICATION_PREFERENCE", action = "UPDATE", entityType = "NotificationPreference")
    @Transactional
    public NotificationPreferenceResponse updatePreference(Long userId, NotificationPreferenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NotificationPreference preference = notificationPreferenceRepository
                .findByUserIdAndNotificationType(userId, request.getNotificationType())
                .orElse(NotificationPreference.builder()
                        .user(user)
                        .notificationType(request.getNotificationType())
                        .emailEnabled(true)
                        .inAppEnabled(true)
                        .build());

        if (request.getEmailEnabled() != null) {
            preference.setEmailEnabled(request.getEmailEnabled());
        }
        if (request.getInAppEnabled() != null) {
            preference.setInAppEnabled(request.getInAppEnabled());
        }
        if (request.getSmsEnabled() != null) {
            preference.setSmsEnabled(request.getSmsEnabled());
        }
        if (request.getPushEnabled() != null) {
            preference.setPushEnabled(request.getPushEnabled());
        }

        notificationPreferenceRepository.save(preference);
        log.info("Notification preference updated for user: {}, type: {}", user.getEmail(), request.getNotificationType());
        return toResponse(preference);
    }

    @Auditable(module = "NOTIFICATION_PREFERENCE", action = "UPDATE_ALL", entityType = "NotificationPreference")
    @Transactional
    public List<NotificationPreferenceResponse> updateAllPreferences(Long userId, List<NotificationPreferenceRequest> requests) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<NotificationPreferenceResponse> responses = new java.util.ArrayList<>();
        
        for (NotificationPreferenceRequest request : requests) {
            NotificationPreference preference = notificationPreferenceRepository
                    .findByUserIdAndNotificationType(userId, request.getNotificationType())
                    .orElse(NotificationPreference.builder()
                            .user(user)
                            .notificationType(request.getNotificationType())
                            .emailEnabled(true)
                            .inAppEnabled(true)
                            .smsEnabled(false)
                            .pushEnabled(true)
                            .build());

            if (request.getEmailEnabled() != null) {
                preference.setEmailEnabled(request.getEmailEnabled());
            }
            if (request.getInAppEnabled() != null) {
                preference.setInAppEnabled(request.getInAppEnabled());
            }
            if (request.getSmsEnabled() != null) {
                preference.setSmsEnabled(request.getSmsEnabled());
            }
            if (request.getPushEnabled() != null) {
                preference.setPushEnabled(request.getPushEnabled());
            }

            notificationPreferenceRepository.save(preference);
            responses.add(toResponse(preference));
        }
        
        log.info("All notification preferences updated for user: {}", user.getEmail());
        return responses;
    }

    @Transactional(readOnly = true)
    public boolean isEmailEnabled(Long userId, String notificationType) {
        return notificationPreferenceRepository.findByUserIdAndNotificationType(userId, notificationType)
                .map(NotificationPreference::getEmailEnabled)
                .orElse(true);
    }

    @Transactional(readOnly = true)
    public boolean isInAppEnabled(Long userId, String notificationType) {
        return notificationPreferenceRepository.findByUserIdAndNotificationType(userId, notificationType)
                .map(NotificationPreference::getInAppEnabled)
                .orElse(true);
    }

    @Transactional(readOnly = true)
    public boolean isSmsEnabled(Long userId, String notificationType) {
        return notificationPreferenceRepository.findByUserIdAndNotificationType(userId, notificationType)
                .map(NotificationPreference::getSmsEnabled)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean isPushEnabled(Long userId, String notificationType) {
        return notificationPreferenceRepository.findByUserIdAndNotificationType(userId, notificationType)
                .map(NotificationPreference::getPushEnabled)
                .orElse(true);
    }

    private List<NotificationPreferenceResponse> getDefaultPreferences() {
        return java.util.Arrays.stream(NOTIFICATION_TYPES)
                .map(type -> NotificationPreferenceResponse.builder()
                        .notificationType(type)
                        .emailEnabled(true)
                        .inAppEnabled(true)
                        .smsEnabled(false)
                        .pushEnabled(true)
                        .build())
                .toList();
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference preference) {
        return NotificationPreferenceResponse.builder()
                .id(preference.getId())
                .notificationType(preference.getNotificationType())
                .emailEnabled(preference.getEmailEnabled())
                .inAppEnabled(preference.getInAppEnabled())
                .smsEnabled(preference.getSmsEnabled())
                .pushEnabled(preference.getPushEnabled())
                .build();
    }
}
