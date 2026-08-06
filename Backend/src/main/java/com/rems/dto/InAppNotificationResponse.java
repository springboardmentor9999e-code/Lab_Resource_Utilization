package com.rems.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InAppNotificationResponse {

    private Long notificationId;
    private String title;
    private String message;
    private String type; // SHARING_REQUEST, SHARING_APPROVED, SHARING_REJECTED, SYSTEM, BOOKING
    private Long relatedId;
    private Boolean isRead;
    private Instant createdAt;
}
