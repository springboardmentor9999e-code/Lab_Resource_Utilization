package com.rems.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${app.twilio.account-sid:AC_demo_account_sid_placeholder}")
    private String accountSid;

    @Value("${app.twilio.auth-token:demo_auth_token_placeholder}")
    private String authToken;

    @Value("${app.twilio.from-number:+15005550006}")
    private String fromNumber;

    private boolean initialized = false;

    @PostConstruct
    public void init() {
        if (accountSid != null && !accountSid.contains("placeholder") &&
            authToken != null && !authToken.contains("placeholder")) {
            try {
                Twilio.init(accountSid, authToken);
                initialized = true;
                log.info("[TWILIO SMS] Initialized Twilio SDK with Account SID {}", accountSid);
            } catch (Exception e) {
                log.warn("[TWILIO SMS] Could not initialize Twilio SDK: {}", e.getMessage());
            }
        } else {
            log.info("[TWILIO SMS] Twilio credentials are placeholders. SMS logs will simulate delivery.");
        }
    }

    @Async
    public void sendSms(String toPhone, String messageText) {
        if (toPhone == null || toPhone.trim().isEmpty()) {
            log.warn("[TWILIO SMS] Cannot send SMS: recipient phone number is empty.");
            return;
        }

        String formattedPhone = formatPhoneNumber(toPhone);
        log.info("[TWILIO SMS NOTIFICATION] Preparing SMS to '{}': {}", formattedPhone, messageText);

        if (initialized) {
            try {
                Message message = Message.creator(
                        new PhoneNumber(formattedPhone),
                        new PhoneNumber(fromNumber),
                        messageText
                ).create();
                log.info("[TWILIO SMS SUCCESS] Sent SMS SID '{}' to '{}'", message.getSid(), formattedPhone);
            } catch (Exception e) {
                log.error("[TWILIO SMS FAILED] Could not send SMS to '{}': {}. (Logged gracefully)", formattedPhone, e.getMessage());
            }
        } else {
            log.info("[TWILIO SMS SIMULATED] Delivered message to '{}': {}", formattedPhone, messageText);
        }
    }

    private String formatPhoneNumber(String phone) {
        String clean = phone.trim().replaceAll("[^0-9+]", "");
        if (clean.startsWith("+")) {
            return clean;
        }
        if (clean.length() == 10) {
            return "+91" + clean; // Default country code for India test number 8252285165
        }
        return "+" + clean;
    }
}
