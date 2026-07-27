package com.labresource.service;

import com.labresource.entity.AppUser;
import com.labresource.entity.Notification;
import com.labresource.repository.AppUserRepository;
import com.labresource.repository.NotificationRepository;
import com.labresource.service.impl.EmailService;
import com.labresource.service.impl.NotificationService;
import com.labresource.service.impl.PushNotificationService;
import com.labresource.service.impl.SmsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Channel fan-out rules for the notification hub: which escalation level reaches which
 * channel, and how a user's opt-out is honoured.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private EmailService emailService;
    @Mock private SmsService smsService;
    @Mock private PushNotificationService pushNotificationService;

    @InjectMocks private NotificationService notificationService;

    private AppUser user;

    @BeforeEach
    void setUp() {
        user = AppUser.builder()
                .userId(1L)
                .username("riya")
                .email("riya@test.local")
                .phone("+919876543210")
                .firstName("Riya")
                .lastName("Sharma")
                .build();
    }

    // -------------------- escalation levels --------------------

    @Test
    void notifyInApp_touchesOnlyTheBell() {
        notificationService.notifyInApp(user, "BOOKING", "Title", "Body", "/dashboard");

        verify(notificationRepository).save(any(Notification.class));
        verifyNoInteractions(emailService, smsService, pushNotificationService);
    }

    @Test
    void notify_sendsInAppAndEmailButNotSmsOrPush() {
        notificationService.notify(user, "BOOKING", "Title", "Body", "/dashboard");

        verify(notificationRepository).save(any(Notification.class));
        verify(emailService).sendNotificationEmail(eq("riya@test.local"), contains("Title"), eq("Body"));
        verifyNoInteractions(smsService, pushNotificationService);
    }

    @Test
    void notifyUrgent_reachesAllFourChannels() {
        notificationService.notifyUrgent(user, "WAITLIST", "Slot Free", "Long body for the bell",
                "/dashboard/bookings", "Short text");

        verify(notificationRepository).save(any(Notification.class));
        verify(emailService).sendNotificationEmail(eq("riya@test.local"), contains("Slot Free"),
                eq("Long body for the bell"));
        // SMS and push get the compact wording, not the long-form body written for the bell.
        verify(smsService).sendSms("+919876543210", "Short text");
        verify(pushNotificationService).sendToUser(user, "Slot Free", "Short text", "/dashboard/bookings");
    }

    @Test
    void notifyUrgent_derivesSmsTextWhenNotGiven() {
        notificationService.notifyUrgent(user, "BOOKING", "Reminder", "Body", "/dashboard");

        verify(smsService).sendSms("+919876543210", "Reminder: Body");
    }

    // -------------------- opt-outs --------------------

    @Test
    void notifyUrgent_skipsSmsWhenUserOptedOut() {
        user.setSmsNotificationsEnabled(false);

        notificationService.notifyUrgent(user, "BOOKING", "Title", "Body", "/dashboard");

        verifyNoInteractions(smsService);
        // Opting out of SMS must not silence push as well.
        verify(pushNotificationService).sendToUser(eq(user), anyString(), anyString(), anyString());
        verify(emailService).sendNotificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void notifyUrgent_skipsPushWhenUserOptedOut() {
        user.setPushNotificationsEnabled(false);

        notificationService.notifyUrgent(user, "BOOKING", "Title", "Body", "/dashboard");

        verifyNoInteractions(pushNotificationService);
        verify(smsService).sendSms(anyString(), anyString());
    }

    @Test
    void nullPreferenceIsTreatedAsEnabled() {
        // Rows that predate the preference columns must keep receiving alerts, not go dark.
        assertNull(user.getSmsNotificationsEnabled());
        assertNull(user.getPushNotificationsEnabled());

        notificationService.notifyUrgent(user, "BOOKING", "Title", "Body", "/dashboard");

        verify(smsService).sendSms(anyString(), anyString());
        verify(pushNotificationService).sendToUser(eq(user), anyString(), anyString(), anyString());
    }

    // -------------------- resilience --------------------

    @Test
    void notifyNeverThrowsWhenTheBellWriteFails() {
        when(notificationRepository.save(any(Notification.class)))
                .thenThrow(new RuntimeException("db down"));

        // A failed notification must not roll back the booking that triggered it.
        assertDoesNotThrow(() ->
                notificationService.notify(user, "BOOKING", "Title", "Body", "/dashboard"));
        verify(emailService).sendNotificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void emailIsSkippedWhenUserHasNoAddress() {
        user.setEmail("");

        notificationService.notify(user, "BOOKING", "Title", "Body", "/dashboard");

        verifyNoInteractions(emailService);
    }

    // -------------------- preferences --------------------

    @Test
    void getPreferences_reportsDefaultsAndPhonePresence() {
        when(appUserRepository.findByUsername("riya")).thenReturn(Optional.of(user));

        Map<String, Object> prefs = notificationService.getPreferences("riya");

        assertEquals(true, prefs.get("smsEnabled"));
        assertEquals(true, prefs.get("pushEnabled"));
        assertEquals(true, prefs.get("phoneOnFile"));
    }

    @Test
    void updatePreferences_leavesOmittedChannelUntouched() {
        when(appUserRepository.findByUsername("riya")).thenReturn(Optional.of(user));

        Map<String, Object> prefs = notificationService.updatePreferences("riya", false, null);

        assertEquals(false, prefs.get("smsEnabled"));
        assertEquals(true, prefs.get("pushEnabled"));
        assertEquals(Boolean.FALSE, user.getSmsNotificationsEnabled());
        assertNull(user.getPushNotificationsEnabled());
        verify(appUserRepository).save(user);
    }

    @Test
    void registerDevice_rejectsBlankToken() {
        assertThrows(RuntimeException.class,
                () -> notificationService.registerDevice("riya", "   ", "WEB"));
        verifyNoInteractions(pushNotificationService);
    }
}
