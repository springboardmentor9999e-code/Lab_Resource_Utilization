package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long notificationId;
    private String type;   // BOOKING | WAITLIST | SHARING | MAINTENANCE | CALIBRATION | BILLING | SYSTEM
    private String title;
    private String message;
    private String link;
    private Boolean read;
    private LocalDateTime createdAt;
}
