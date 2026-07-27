package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class BookingResponse {
    private Long bookingId;
    private Long userId;
    private String username;
    private String userFullName;
    private String userRole;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String labName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status; // PENDING | CONFIRMED | IN_USE | COMPLETED | CANCELLED | NO_SHOW | REJECTED
    private LocalDateTime createdAt;
}
