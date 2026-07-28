package com.lrplatform.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from-address:noreply@lrplatform.com}")
    private String fromAddress;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Lab Resource Platform");
            message.setText("You requested a password reset.\n\n"
                    + "Click the link below to reset your password:\n"
                    + resetUrl + "\n\n"
                    + "This link will expire in 1 hour.\n\n"
                    + "If you did not request this, please ignore this email.");

            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendNotificationEmail(String toEmail, String title, String message, String notificationType) {
        try {
            String htmlBody = buildNotificationHtml(title, message, notificationType);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(fromAddress != null ? fromAddress : "noreply@lrplatform.com");
            helper.setTo(toEmail != null ? toEmail : "");
            helper.setSubject((title != null ? title : "Notification") + " - Lab Resource Platform");
            helper.setText(htmlBody != null ? htmlBody : "", true);

            mailSender.send(mimeMessage);
            log.info("Notification email sent to {}: {}", toEmail, title);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendBookingApprovedEmail(String toEmail, String equipmentName, String bookingDate) {
        String title = "Booking Approved";
        String message = String.format(
            "Your booking for <strong>%s</strong> on <strong>%s</strong> has been approved. "
            + "Please proceed to the lab at the scheduled time.",
            equipmentName, bookingDate
        );
        sendNotificationEmail(toEmail, title, message, "BOOKING_APPROVED");
    }

    @Async
    public void sendBookingRejectedEmail(String toEmail, String equipmentName, String bookingDate, String reason) {
        String title = "Booking Rejected";
        String message = String.format(
            "Your booking for <strong>%s</strong> on <strong>%s</strong> has been rejected.%s",
            equipmentName, bookingDate,
            (reason != null && !reason.isEmpty()) ? " Reason: " + reason : ""
        );
        sendNotificationEmail(toEmail, title, message, "BOOKING_REJECTED");
    }

    @Async
    public void sendMaintenanceScheduledEmail(String toEmail, String equipmentName, String scheduledDate) {
        String title = "Maintenance Scheduled";
        String message = String.format(
            "Maintenance has been scheduled for <strong>%s</strong> on <strong>%s</strong>. "
            + "The equipment may be unavailable during this period.",
            equipmentName, scheduledDate
        );
        sendNotificationEmail(toEmail, title, message, "MAINTENANCE_SCHEDULED");
    }

    @Async
    public void sendBookingReminderEmail(String toEmail, String equipmentName, String startTime) {
        String title = "Booking Reminder";
        String message = String.format(
            "This is a reminder that your booking for <strong>%s</strong> starts at <strong>%s</strong>.",
            equipmentName, startTime
        );
        sendNotificationEmail(toEmail, title, message, "BOOKING_REMINDER");
    }

    @Async
    public void sendCalibrationDueEmail(String toEmail, String equipmentName, String dueDate) {
        String title = "Calibration Due";
        String message = String.format(
            "Calibration for <strong>%s</strong> is due on <strong>%s</strong>. "
            + "Please schedule calibration to ensure accurate operation.",
            equipmentName, dueDate
        );
        sendNotificationEmail(toEmail, title, message, "CALIBRATION_DUE");
    }

    private String buildNotificationHtml(String title, String message, String notificationType) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 20px; }
                    .content { padding: 24px; color: #333; line-height: 1.6; }
                    .content h2 { color: #1f2937; margin-top: 0; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #e0e7ff; color: #4338ca; margin-bottom: 12px; }
                    .footer { padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                    .footer a { color: #4f46e5; text-decoration: none; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Lab Resource Platform</h1>
                    </div>
                    <div class="content">
                        <span class="badge">%s</span>
                        <h2>%s</h2>
                        <p>%s</p>
                    </div>
                    <div class="footer">
                        <p><a href="%s">View in Dashboard</a></p>
                        <p>Lab Resource Utilization Platform</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(
                notificationType != null ? notificationType.replace("_", " ") : "NOTIFICATION",
                title,
                message,
                frontendUrl + "/notifications"
        );
    }
}
