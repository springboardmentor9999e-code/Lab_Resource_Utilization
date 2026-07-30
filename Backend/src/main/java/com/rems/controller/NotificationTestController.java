package com.rems.controller;

import com.rems.service.EmailService;
import com.rems.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationTestController {

    private final EmailService emailService;
    private final SmsService smsService;

    @PostMapping("/test-email")
    public ResponseEntity<Map<String, String>> testEmail(@RequestParam(defaultValue = "akshay7708209@gmail.com") String to) {
        String subject = "Test Notification - LabMaintain System";
        String body = "<div style='font-family: Arial, sans-serif; padding: 20px; background-color: #f4f6f9;'>" +
                "<h2 style='color: #008ba6;'>LabMaintain Email Test</h2>" +
                "<p>Hello <strong>Akshay</strong>,</p>" +
                "<p>This is a test notification from your Research Equipment Management System!</p>" +
                "<p>If you receive this email, your JavaMailSender SMTP integration is working perfectly.</p>" +
                "</div>";

        emailService.sendEmail(to, subject, body);
        return ResponseEntity.ok(Map.of(
                "status", "DISPATCHED",
                "recipient", to,
                "message", "Test email dispatch triggered. Check backend logs and inbox."
        ));
    }

    @PostMapping("/test-sms")
    public ResponseEntity<Map<String, String>> testSms(@RequestParam(defaultValue = "+918252285165") String to) {
        String messageText = "LabMaintain Test SMS: Hello Akshay, your notification system test is successful!";
        smsService.sendSms(to, messageText);
        return ResponseEntity.ok(Map.of(
                "status", "DISPATCHED",
                "recipient", to,
                "message", "Test SMS dispatch triggered. Check backend logs and phone."
        ));
    }
}
