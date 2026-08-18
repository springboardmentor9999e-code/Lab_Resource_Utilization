package com.lab.backend.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class EmailService {
    
    public void sendWaitlistNotification(String userEmail, String resourceName, LocalDate startDate, LocalDate endDate, Long waitlistId) {
        // System logging / stub email notification implementation
        System.out.println("Email notification sent to " + userEmail + " for resource " + resourceName + " (" + startDate + " to " + endDate + "). Waitlist ID: " + waitlistId);
    }
}
