package com.rems.service;

import com.rems.entity.Booking;
import com.rems.entity.Equipment;
import com.rems.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final EmailService emailService;
    private final SmsService smsService;

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm 'UTC'")
            .withZone(ZoneId.of("UTC"));

    // 1. Student / Researcher Notifications
    public void sendBookingConfirmation(User student, Booking booking) {
        if (student == null) return;
        try {
            String eqName = booking.getEquipment() != null ? booking.getEquipment().getName() : "Lab Equipment";
            String startTime = booking.getStartTime() != null ? dateFormatter.format(booking.getStartTime()) : "N/A";
            String endTime = booking.getEndTime() != null ? dateFormatter.format(booking.getEndTime()) : "N/A";

            String subject = "Booking Confirmation: " + eqName;
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;'>" +
                    "<h2 style='color: #008ba6;'>Booking Confirmation</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>Your booking for <strong>%s</strong> has been successfully registered.</p>" +
                    "<ul>" +
                    "<li><strong>Booking ID:</strong> %d</li>" +
                    "<li><strong>Start Window:</strong> %s</li>" +
                    "<li><strong>End Window:</strong> %s</li>" +
                    "<li><strong>Purpose:</strong> %s</li>" +
                    "</ul>" +
                    "<p style='color: #555;'>Please ensure equipment is returned prior to the expiration window.</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Team</strong></p>" +
                    "</div></div>",
                    student.getName(), eqName, booking.getBookingId(), startTime, endTime, booking.getPurpose()
            );

            String smsText = String.format(
                    "LabMaintain: Hello %s, your booking for '%s' (ID: %d) is confirmed for %s to %s.",
                    student.getName(), eqName, booking.getBookingId(), startTime, endTime
            );

            emailService.sendEmail(student.getEmail(), subject, htmlBody);
            smsService.sendSms(student.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch booking confirmation notification: {}", e.getMessage());
        }
    }

    public void sendReturnConfirmation(User student, Booking booking) {
        if (student == null) return;
        try {
            String eqName = booking.getEquipment() != null ? booking.getEquipment().getName() : "Lab Equipment";

            String subject = "Return Confirmation: " + eqName;
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;'>" +
                    "<h2 style='color: #2e7d32;'>Return Confirmation</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>The return for <strong>%s</strong> (Booking ID: %d) has been processed and logged successfully.</p>" +
                    "<p>Thank you for returning the equipment on time!</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Team</strong></p>" +
                    "</div></div>",
                    student.getName(), eqName, booking.getBookingId()
            );

            String smsText = String.format(
                    "LabMaintain: Hello %s, equipment return for '%s' (ID: %d) has been confirmed successfully.",
                    student.getName(), eqName, booking.getBookingId()
            );

            emailService.sendEmail(student.getEmail(), subject, htmlBody);
            smsService.sendSms(student.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch return confirmation notification: {}", e.getMessage());
        }
    }

    public void sendWaitlistAvailabilityNotification(User student, Equipment equipment) {
        if (student == null || equipment == null) return;
        try {
            String subject = "Waitlist Alert: " + equipment.getName() + " is Now Available!";
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;'>" +
                    "<h2 style='color: #008ba6;'>Equipment Available</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>Good news! <strong>%s</strong> is now available in your lab queue.</p>" +
                    "<p>Please log in to your portal to claim and finalize your booking slot.</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Team</strong></p>" +
                    "</div></div>",
                    student.getName(), equipment.getName()
            );

            String smsText = String.format(
                    "LabMaintain Alert: Hello %s, '%s' is now available! Log in to claim your reservation slot.",
                    student.getName(), equipment.getName()
            );

            emailService.sendEmail(student.getEmail(), subject, htmlBody);
            smsService.sendSms(student.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch waitlist notification: {}", e.getMessage());
        }
    }

    public void sendEquipmentDueDateReminder(User student, Booking booking) {
        if (student == null) return;
        try {
            String eqName = booking.getEquipment() != null ? booking.getEquipment().getName() : "Lab Equipment";
            String endTime = booking.getEndTime() != null ? dateFormatter.format(booking.getEndTime()) : "Today";

            String subject = "REMINDER: Equipment Return Due Today - " + eqName;
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #fff3e0;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #ffe0b2;'>" +
                    "<h2 style='color: #e65100;'>Equipment Due Date Reminder</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>This is a reminder that your booking for <strong>%s</strong> is due for return on <strong>%s</strong>.</p>" +
                    "<p>Please return the equipment to the lab technician or log return in the portal to avoid penalty or queue delays.</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Team</strong></p>" +
                    "</div></div>",
                    student.getName(), eqName, endTime
            );

            String smsText = String.format(
                    "LabMaintain Reminder: Hello %s, '%s' (Booking ID: %d) is due for return today (%s). Please return asset.",
                    student.getName(), eqName, booking.getBookingId(), endTime
            );

            emailService.sendEmail(student.getEmail(), subject, htmlBody);
            smsService.sendSms(student.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch due date reminder: {}", e.getMessage());
        }
    }

    // 2. Account Approval Notification
    public void sendAccountApprovalNotification(User user) {
        if (user == null) return;
        try {
            String subject = "Account Approval Confirmed - Welcome to LabMaintain";
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0;'>" +
                    "<h2 style='color: #2e7d32;'>Account Approved</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>Your account registration has been approved by your department administrator.</p>" +
                    "<p>You may now log in to access equipment features and operational management.</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Team</strong></p>" +
                    "</div></div>",
                    user.getName()
            );

            String smsText = String.format(
                    "LabMaintain: Hello %s, your account has been approved! You can now log in to the portal.",
                    user.getName()
            );

            emailService.sendEmail(user.getEmail(), subject, htmlBody);
            smsService.sendSms(user.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch account approval notification: {}", e.getMessage());
        }
    }

    // 3. Approval Request Notification to Managers, Dept Heads, Inst Admins
    public void sendApprovalRequestNotification(User approver, String requestTitle, String details) {
        if (approver == null) return;
        try {
            String subject = "Action Required: " + requestTitle;
            String htmlBody = String.format(
                    "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #e3f2fd;'>" +
                    "<div style='max-width: 600px; margin: auto; background: white; padding: 25px; border-radius: 10px; border: 1px solid #bbdefb;'>" +
                    "<h2 style='color: #1565c0;'>Approval Required</h2>" +
                    "<p>Hello <strong>%s</strong>,</p>" +
                    "<p>A new request requires your review and authorization:</p>" +
                    "<blockquote><strong>%s</strong></blockquote>" +
                    "<p style='color: #555;'>Details: %s</p>" +
                    "<p>Please log in to your manager dashboard to authorize or decline this request.</p>" +
                    "<p>Best regards,<br/><strong>LabMaintain Administrative Suite</strong></p>" +
                    "</div></div>",
                    approver.getName(), requestTitle, details
            );

            String smsText = String.format(
                    "LabMaintain Action Required: Hello %s, new approval request: '%s'. Log in to authorize.",
                    approver.getName(), requestTitle
            );

            emailService.sendEmail(approver.getEmail(), subject, htmlBody);
            smsService.sendSms(approver.getPhone(), smsText);
        } catch (Exception e) {
            log.error("Failed to dispatch approval request notification: {}", e.getMessage());
        }
    }
}
