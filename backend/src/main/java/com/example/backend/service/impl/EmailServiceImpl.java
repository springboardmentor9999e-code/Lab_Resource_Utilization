package com.example.backend.service.impl;

import com.example.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);
        message.setSubject("Password Reset OTP");

        message.setText(
                "Hello,\n\n" +
                        "Your OTP for password reset is: " + otp +
                        "\n\nThis OTP is valid for 10 minutes." +
                        "\n\nDo not share this OTP with anyone." +
                        "\n\nRegards,\nStudent Management System"
        );

        mailSender.send(message);
    }
}