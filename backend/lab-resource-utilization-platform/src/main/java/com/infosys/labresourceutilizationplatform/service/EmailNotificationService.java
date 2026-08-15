package com.infosys.labresourceutilizationplatform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    @Value("${app.mail.from:noreply@labresource.com}")
    private String fromEmail;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    /**
     * Send email asynchronously with graceful error handling.
     * Delivery failures will NEVER break the calling business operation.
     */
    @Async
    public CompletableFuture<Boolean> sendEmailAsync(String toEmail, String subject, String body) {
        return CompletableFuture.completedFuture(sendEmail(toEmail, subject, body));
    }

    /**
     * Synchronous send method returning boolean success/failure.
     */
    public boolean sendEmail(String toEmail, String subject, String body) {
        boolean isTargetSubject = "Login Notification".equalsIgnoreCase(subject) || "Registration Confirmation".equalsIgnoreCase(subject);
        
        if (isTargetSubject) {
            log.info("Login email requested for: {}", toEmail);
        }

        if (!emailEnabled) {
            log.info("[EMAIL SERVICE] Email notifications are disabled via configuration. Target: {}", toEmail);
            if (isTargetSubject) {
                log.info("Email sending failed: Email notifications are disabled via configuration");
            }
            return false;
        }

        if (toEmail == null || toEmail.trim().isEmpty() || !toEmail.contains("@")) {
            log.warn("[EMAIL SERVICE] Invalid recipient email address: '{}'. Email skipped.", toEmail);
            if (isTargetSubject) {
                log.info("Email sending failed: Invalid recipient email address");
            }
            return false;
        }

        // Check if SMTP is configured
        if (mailSender == null || smtpHost == null || smtpHost.trim().isEmpty() || smtpUsername == null || smtpUsername.trim().isEmpty()) {
            log.warn("[EMAIL SERVICE CONFIGURATION] SMTP is not fully configured (host: '{}', username: '{}'). " +
                    "To enable real email delivery, set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD. " +
                    "Skipping live SMTP delivery to: {} | Subject: '{}'", smtpHost, smtpUsername, toEmail, subject);
            if (isTargetSubject) {
                log.info("Email sending failed: SMTP is not configured (host: " + smtpHost + ", username: " + smtpUsername + ")");
            }
            return false;
        }

        if (isTargetSubject) {
            log.info("Email sending started");
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(toEmail.trim());
            mailMessage.setSubject("[Lab Resource Platform] " + subject);
            mailMessage.setText(formatEmailBody(subject, body));

            mailSender.send(mailMessage);
            log.info("[EMAIL SERVICE] Email successfully dispatched to {} | Subject: '{}'", toEmail, subject);
            if (isTargetSubject) {
                log.info("Email sending succeeded");
            }
            return true;
        } catch (Exception ex) {
            log.error("[EMAIL SERVICE FAILURE] Failed to deliver email to {}: {}. Business flow will continue unaffected.",
                    toEmail, ex.getMessage());
            if (isTargetSubject) {
                log.info("Email sending failed: {}", ex.getMessage());
            }
            return false;
        }
    }

    private String formatEmailBody(String subject, String body) {
        StringBuilder sb = new StringBuilder();
        sb.append("Notification: ").append(subject).append("\n\n");
        sb.append(body).append("\n\n");
        sb.append("---\n");
        sb.append("Lab Resource Utilization Platform\n");
        sb.append("This is an automated notification. Please do not reply directly to this email.");
        return sb.toString();
    }
}
