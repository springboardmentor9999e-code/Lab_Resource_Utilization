package com.rems.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:akshay7708209@gmail.com}")
    private String fromEmail;

    @Async
    public void sendEmail(String toEmail, String subject, String bodyHtml) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            log.warn("Cannot send email: recipient email address is empty.");
            return;
        }

        try {
            log.info("[EMAIL NOTIFICATION] Preparing email to '{}' with subject '{}'", toEmail, subject);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);

            mailSender.send(message);
            log.info("[EMAIL NOTIFICATION SUCCESS] Sent email to '{}'", toEmail);
        } catch (Exception e) {
            log.error("[EMAIL NOTIFICATION FAILED] Could not send email to '{}': {}", toEmail, e.getMessage(), e);
        }
    }
}
