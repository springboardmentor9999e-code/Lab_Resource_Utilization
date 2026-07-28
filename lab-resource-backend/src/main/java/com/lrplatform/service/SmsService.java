package com.lrplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${app.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${app.sms.provider:stub}")
    private String smsProvider;

    @Async
    public void sendSms(String phoneNumber, String message) {
        if (!smsEnabled) {
            log.debug("SMS notifications disabled. Would send to {}: {}", phoneNumber, message);
            return;
        }

        try {
            if ("twilio".equals(smsProvider)) {
                sendViaTwilio(phoneNumber, message);
            } else {
                log.info("SMS stub [to={}]: {}", phoneNumber, message);
            }
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", phoneNumber, e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmationSms(String phoneNumber, String equipmentName, String bookingDate) {
        String message = String.format("Your booking for %s on %s has been confirmed.", equipmentName, bookingDate);
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendBookingReminderSms(String phoneNumber, String equipmentName, String startTime) {
        String message = String.format("Reminder: Your booking for %s starts at %s.", equipmentName, startTime);
        sendSms(phoneNumber, message);
    }

    @Async
    public void sendMaintenanceAlertSms(String phoneNumber, String equipmentName, String scheduledDate) {
        String message = String.format("Maintenance scheduled for %s on %s. The equipment may be unavailable.", equipmentName, scheduledDate);
        sendSms(phoneNumber, message);
    }

    private void sendViaTwilio(String phoneNumber, String message) {
        // Twilio integration placeholder
        // Requires: com.twilio.sdk:twilio dependency and TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN env vars
        log.info("Twilio SMS [to={}]: {}", phoneNumber, message);
    }
}
