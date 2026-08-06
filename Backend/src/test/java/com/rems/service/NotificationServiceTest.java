package com.rems.service;

import com.rems.entity.Equipment;
import com.rems.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Equipment testEquipment;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .userId(1L)
                .name("Alice Developer")
                .email("alice@example.com")
                .phone("+1234567890")
                .build();

        testEquipment = Equipment.builder()
                .equipmentId(100L)
                .name("High-Speed Centrifuge")
                .build();
    }

    @Test
    void testSendWaitlistAvailabilityNotification() {
        notificationService.sendWaitlistAvailabilityNotification(testUser, testEquipment);

        verify(emailService).sendEmail(
                eq("alice@example.com"),
                contains("Waitlist Alert: High-Speed Centrifuge is Now Available!"),
                contains("High-Speed Centrifuge")
        );

        verify(smsService).sendSms(
                eq("+1234567890"),
                contains("High-Speed Centrifuge")
        );
    }
}
