package com.rems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitlistResponse {
    private Long waitlistId;
    private Long equipmentId;
    private String equipmentName;
    private String labName;
    private Long userId;
    private String userName;
    private String userEmail;
    private Instant requestedStart;
    private Instant requestedEnd;
    private String status;
    private Instant createdAt;
    private Instant notifiedAt;
    private Integer queuePosition;
}
