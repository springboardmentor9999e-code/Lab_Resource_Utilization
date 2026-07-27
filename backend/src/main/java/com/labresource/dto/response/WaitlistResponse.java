package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class WaitlistResponse {
    private Long waitlistId;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String labName;
    private Long userId;
    private String username;
    private String userFullName;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer priority;
    private String status; // WAITING | NOTIFIED | CONVERTED | EXPIRED | CANCELLED
    private LocalDateTime requestedAt;
    private LocalDateTime notifiedAt;
    // Deadline for a NOTIFIED user to book the freed slot before it passes to the next in line
    private LocalDateTime offerExpiresAt;
    // Whole hours left on that claim; null unless the entry is NOTIFIED, 0 once lapsed
    private Long offerHoursRemaining;
    // 1-based rank among active (WAITING/NOTIFIED) entries for the same
    // equipment + date, ordered by requestedAt. Null for terminal entries.
    private Integer position;
}
