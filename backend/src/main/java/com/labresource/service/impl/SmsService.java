package com.labresource.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * SMS delivery through the Twilio REST API.
 *
 * <p>Called directly over HTTP rather than through the Twilio SDK: the Messages endpoint is a
 * form POST behind HTTP basic auth, so the SDK would add a dependency without adding capability.
 *
 * <p>Follows the same contract as {@link EmailService} — when credentials are absent the message
 * is logged instead of sent, so booking and maintenance flows stay demonstrable without a paid
 * Twilio account, and a delivery failure never propagates into the caller's transaction.
 */
@Service
@Slf4j
public class SmsService {

    /** Twilio rejects bodies over 1600 chars; keep well inside a few segments. */
    private static final int MAX_BODY_LENGTH = 480;

    private final RestClient restClient;

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.from-number:}")
    private String fromNumber;

    public SmsService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl("https://api.twilio.com").build();
    }

    /**
     * Sends one SMS. Never throws.
     *
     * @param toPhone E.164 number ("+919876543210"). Blank numbers are skipped silently —
     *                phone is optional on a user profile.
     */
    @Async
    public void sendSms(String toPhone, String body) {
        if (toPhone == null || toPhone.isBlank()) {
            return;
        }
        String text = truncate(body);
        boolean credentialsMissing = accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank();

        if (!smsEnabled || credentialsMissing) {
            if (smsEnabled) {
                log.warn("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER not configured "
                        + "— logging SMS instead of sending.");
            }
            log.info("[SMS FALLBACK] To: {} | Body: {}", toPhone, text);
            return;
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", toPhone);
            form.add("From", fromNumber);
            form.add("Body", text);

            restClient.post()
                    .uri("/2010-04-01/Accounts/{sid}/Messages.json", accountSid)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .headers(headers -> headers.setBasicAuth(accountSid, authToken))
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();

            log.info("SMS sent to {}", maskPhone(toPhone));
        } catch (Exception ex) {
            log.error("Failed to send SMS to {}: {}", maskPhone(toPhone), ex.getMessage());
            log.info("[SMS FALLBACK after failure] To: {} | Body: {}", toPhone, text);
        }
    }

    private String truncate(String body) {
        String text = body == null ? "" : body.trim();
        return text.length() <= MAX_BODY_LENGTH ? text : text.substring(0, MAX_BODY_LENGTH - 1) + "…";
    }

    /** Phone numbers are personal data — keep only the last 4 digits out of the logs' reach. */
    private String maskPhone(String phone) {
        return phone.length() <= 4 ? "****" : "****" + phone.substring(phone.length() - 4);
    }
}
