package com.labresource.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Create a recurring booking series. Occurrences are generated as individual
 * PENDING bookings; dates with conflicts are skipped and reported back.
 */
@Data
public class RecurringBookingRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Frequency is required (DAILY or WEEKLY)")
    private String frequency; // DAILY | WEEKLY

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;
}
