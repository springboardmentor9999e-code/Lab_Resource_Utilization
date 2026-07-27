package com.labresource.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Async
    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        String subject = "Lab Resource Platform — Password Reset OTP";
        String body = """
                Hi %s,

                We received a request to reset your Lab Resource Platform password.

                Your One-Time Password (OTP) is:

                        %s

                This OTP is valid for 10 minutes and can be used only once.
                If you did not request a password reset, please ignore this email.

                — Lab Resource Platform Team
                """.formatted(firstName, otp);

        sendEmail(toEmail, subject, body);
    }

    @Async
    public void sendPasswordChangedEmail(String toEmail, String firstName) {
        String subject = "Lab Resource Platform — Password Changed";
        String body = """
                Hi %s,

                Your password was changed successfully.
                If you did not perform this action, contact your administrator immediately.

                — Lab Resource Platform Team
                """.formatted(firstName);

        sendEmail(toEmail, subject, body);
    }

    /**
     * Generic notification email — used by booking, waitlist, sharing and
     * utilization modules so they don't each need their own mail plumbing.
     */
    @Async
    public void sendNotificationEmail(String toEmail, String subject, String body) {
        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String toEmail, String subject, String body) {
        boolean credentialsMissing = smtpUsername == null || smtpUsername.isBlank();

        if (!mailEnabled || credentialsMissing) {
            // Dev fallback: log instead of sending, so the flow is testable without SMTP.
            if (credentialsMissing && mailEnabled) {
                log.warn("MAIL_USERNAME / MAIL_PASSWORD not configured — logging email instead of sending.");
            }
            log.info("[MAIL FALLBACK] To: {} | Subject: {} | Body:\n{}", toEmail, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // Gmail SMTP silently rewrites/rejects a From that differs from the
            // authenticated account — always send from the real SMTP user.
            message.setFrom(smtpUsername);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}", toEmail);
        } catch (Exception ex) {
            // Never fail the API call because of SMTP problems; surface the content in logs.
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage());
            log.info("[MAIL FALLBACK after failure] To: {} | Subject: {} | Body:\n{}", toEmail, subject, body);
        }
    }
}
