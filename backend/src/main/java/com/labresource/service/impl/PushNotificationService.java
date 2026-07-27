package com.labresource.service.impl;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.*;
import com.labresource.entity.AppUser;
import com.labresource.entity.UserDeviceToken;
import com.labresource.repository.UserDeviceTokenRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.io.FileInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Push notifications through Firebase Cloud Messaging.
 *
 * <p>Like {@link EmailService} and {@link SmsService}, this degrades to a log line when it is not
 * configured, so no flow depends on a Firebase project existing. Configuration is a service
 * account JSON key: set {@code FIREBASE_CREDENTIALS} to its path.
 *
 * <p>Devices register their FCM token through {@code POST /api/notifications/device-tokens}.
 * A token that FCM rejects as unregistered (app uninstalled, token rotated) is deleted rather
 * than retried, which is what keeps the table from filling with dead rows.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    /** FCM caps a notification body; anything longer is silently dropped by some clients. */
    private static final int MAX_BODY_LENGTH = 240;

    private final UserDeviceTokenRepository deviceTokenRepository;

    @Value("${app.push.enabled:false}")
    private boolean pushEnabled;

    @Value("${app.push.firebase-credentials:}")
    private String credentialsPath;

    private volatile boolean initialized;

    /**
     * Initialises the Firebase app once at startup. A failure here (bad path, malformed key)
     * disables push and logs — it must not stop the application from booting.
     */
    @PostConstruct
    void init() {
        if (!pushEnabled) {
            log.info("Push notifications disabled (app.push.enabled=false) — FCM sends will be logged.");
            return;
        }
        if (credentialsPath == null || credentialsPath.isBlank()) {
            log.warn("FIREBASE_CREDENTIALS not configured — logging push notifications instead of sending.");
            return;
        }
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                try (InputStream serviceAccount = new FileInputStream(credentialsPath)) {
                    FirebaseApp.initializeApp(FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build());
                }
            }
            initialized = true;
            log.info("Firebase Cloud Messaging initialised — push notifications active.");
        } catch (Exception ex) {
            log.error("Firebase initialisation failed ({}) — push notifications will be logged instead.",
                    ex.getMessage());
        }
    }

    /**
     * Pushes to every device the user has registered. Never throws.
     *
     * <p>Runs in its own transaction: it is called asynchronously, after the caller's transaction
     * has already committed, so it cannot join one.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendToUser(AppUser user, String title, String body, String link) {
        try {
            List<UserDeviceToken> devices = deviceTokenRepository.findByUser_UserId(user.getUserId());
            if (devices.isEmpty()) {
                return;
            }
            String text = truncate(body);

            if (!initialized) {
                log.info("[PUSH FALLBACK] To: {} ({} device(s)) | {} — {}",
                        user.getUsername(), devices.size(), title, text);
                return;
            }

            List<String> tokens = devices.stream().map(UserDeviceToken::getToken).toList();
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .setNotification(Notification.builder().setTitle(title).setBody(text).build())
                    // The click action the SPA/mobile app routes to when the notification is tapped.
                    .putData("link", link == null ? "/dashboard" : link)
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            pruneDeadTokens(tokens, response);

            log.info("Push sent to {} — {} delivered, {} failed",
                    user.getUsername(), response.getSuccessCount(), response.getFailureCount());
        } catch (Exception ex) {
            log.error("Failed to push to {}: {}", user.getUsername(), ex.getMessage());
        }
    }

    /** Registers (or refreshes) a device token for a user. */
    @Transactional
    public void registerDevice(AppUser user, String token, String platform) {
        UserDeviceToken existing = deviceTokenRepository.findByToken(token).orElse(null);
        if (existing != null) {
            // FCM hands the same token to whoever installs the app on that device. If the device
            // changed hands, the row must follow the new owner rather than keep pushing to the old.
            existing.setUser(user);
            existing.setLastSeenAt(LocalDateTime.now());
            deviceTokenRepository.save(existing);
            return;
        }
        deviceTokenRepository.save(UserDeviceToken.builder()
                .user(user)
                .token(token)
                .platform(platform == null || platform.isBlank() ? "WEB" : platform.trim().toUpperCase())
                .build());
    }

    @Transactional
    public void unregisterDevice(String token) {
        deviceTokenRepository.deleteByToken(token);
    }

    /** Drops tokens FCM says will never deliver again. Transient errors are left alone. */
    private void pruneDeadTokens(List<String> tokens, BatchResponse response) {
        List<String> dead = new ArrayList<>();
        List<SendResponse> responses = response.getResponses();
        for (int i = 0; i < responses.size(); i++) {
            SendResponse r = responses.get(i);
            if (r.isSuccessful() || r.getException() == null) {
                continue;
            }
            MessagingErrorCode code = r.getException().getMessagingErrorCode();
            if (code == MessagingErrorCode.UNREGISTERED || code == MessagingErrorCode.INVALID_ARGUMENT) {
                dead.add(tokens.get(i));
            }
        }
        if (!dead.isEmpty()) {
            deviceTokenRepository.deleteByTokenIn(dead);
            log.info("Pruned {} dead FCM token(s)", dead.size());
        }
    }

    private String truncate(String body) {
        String text = body == null ? "" : body.trim();
        return text.length() <= MAX_BODY_LENGTH ? text : text.substring(0, MAX_BODY_LENGTH - 1) + "…";
    }
}
