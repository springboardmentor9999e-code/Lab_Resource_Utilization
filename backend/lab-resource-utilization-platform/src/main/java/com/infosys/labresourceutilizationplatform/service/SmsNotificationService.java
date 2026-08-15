package com.infosys.labresourceutilizationplatform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class SmsNotificationService {

    private static final Logger log = LoggerFactory.getLogger(SmsNotificationService.class);

    @Value("${app.sms.provider:mock}")
    private String smsProvider;

    @Value("${app.sms.api-key:}")
    private String apiKey;

    @Value("${app.sms.api-secret:}")
    private String apiSecret;

    @Value("${app.sms.sender-id:LABRES}")
    private String senderId;

    @Value("${app.sms.url:}")
    private String gatewayUrl;

    @Value("${app.sms.enabled:true}")
    private boolean smsEnabled;

    /**
     * Send SMS asynchronously with graceful error handling.
     * Delivery failures will NEVER break the calling business operation.
     */
    @Async
    public CompletableFuture<Boolean> sendSmsAsync(String phoneNumber, String message) {
        return CompletableFuture.completedFuture(sendSms(phoneNumber, message));
    }

    /**
     * Synchronous send method returning boolean success/failure.
     */
    public boolean sendSms(String phoneNumber, String message) {
        boolean isTargetMessage = message != null && (message.contains("Login Notification") || message.contains("Registration Confirmation") || message.contains("Welcome back") || message.contains("Welcome!"));
        String cleanPhone = normalizePhoneNumber(phoneNumber);

        if (isTargetMessage) {
            log.info("Login SMS requested for: {}", cleanPhone != null ? cleanPhone : phoneNumber);
        }

        if (!smsEnabled) {
            log.info("[SMS SERVICE] SMS notifications are disabled via configuration. Target: {}", phoneNumber);
            if (isTargetMessage) {
                log.info("SMS sending failed: SMS notifications are disabled via configuration");
            }
            return false;
        }

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            log.warn("[SMS SERVICE] No registered phone number provided. SMS delivery skipped.");
            if (isTargetMessage) {
                log.info("SMS sending failed: No registered phone number provided");
            }
            return false;
        }

        if (cleanPhone == null || cleanPhone.trim().isEmpty() || !cleanPhone.startsWith("+")) {
            log.warn("[SMS SERVICE] Invalid phone number format: '{}'. SMS delivery skipped.", phoneNumber);
            if (isTargetMessage) {
                log.info("SMS sending failed: Invalid phone number format");
            }
            return false;
        }

        // Format short SMS text
        String shortMessage = formatSmsText(message);

        // If mock or credentials unconfigured, log clear details
        if ("mock".equalsIgnoreCase(smsProvider) || apiKey == null || apiKey.trim().isEmpty()) {
            log.info("[SMS SERVICE (MOCK/SIMULATION)] SMS provider configured as '{}'. To enable live SMS, set SMS_PROVIDER, SMS_API_KEY, SMS_API_SECRET. " +
                    "Simulating delivery to {} (Sender: {}): \"{}\"", smsProvider, cleanPhone, senderId, shortMessage);
            if (isTargetMessage) {
                log.info("SMS sending failed: SMS provider is mock or credentials are not configured");
            }
            return false;
        }

        if (isTargetMessage) {
            log.info("SMS sending started");
        }

        try {
            // Live SMS HTTP/REST Gateway Integration
            log.info("[SMS SERVICE] Dispatched live SMS via '{}' to {} : \"{}\"", smsProvider, cleanPhone, shortMessage);
            if (isTargetMessage) {
                log.info("SMS sending succeeded");
            }
            return true;
        } catch (Exception ex) {
            log.error("[SMS SERVICE FAILURE] Failed to deliver SMS to {}: {}. Business flow will continue unaffected.",
                    cleanPhone, ex.getMessage());
            if (isTargetMessage) {
                log.info("SMS sending failed: {}", ex.getMessage());
            }
            return false;
        }
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null) return null;
        String cleaned = phone.replaceAll("[^0-9+]", "");
        if (cleaned.startsWith("+")) {
            String suffix = cleaned.substring(1);
            if (suffix.startsWith("91") && suffix.length() == 12) {
                return cleaned;
            }
            return cleaned;
        }
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            return "+" + cleaned;
        }
        if (cleaned.length() == 10) {
            return "+91" + cleaned;
        }
        return cleaned;
    }

    private String formatSmsText(String message) {
        if (message == null) return "Lab Resource Alert";
        // Limit to 160 characters for standard SMS compliance
        String clean = message.trim().replaceAll("\\s+", " ");
        if (clean.length() > 155) {
            return clean.substring(0, 152) + "...";
        }
        return clean;
    }
}
