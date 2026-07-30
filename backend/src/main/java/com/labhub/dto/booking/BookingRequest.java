package com.labhub.dto.booking;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Request DTO for creating a booking.
 */
@Data
public class BookingRequest {

    @NotNull(message = "Equipment ID is required")
    private UUID equipmentId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    private LocalDateTime endTime;

    private String purpose;

    private String notes;
}
