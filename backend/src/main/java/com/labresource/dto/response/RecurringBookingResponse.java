package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class RecurringBookingResponse {
    private Long recurringId;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String username;
    private String frequency; // DAILY | WEEKLY
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status; // ACTIVE | CANCELLED
    private Integer occurrencesCreated;
    private Integer occurrencesSkipped;
    private List<LocalDate> skippedDates; // populated on creation only
    private LocalDateTime createdAt;
}
