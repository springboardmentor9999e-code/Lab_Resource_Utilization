package com.labhub.dto.booking;

import com.labhub.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for booking data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;
    private String bookingReference;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private String notes;
    private BookingStatus status;

    private UUID userId;
    private String userName;
    private String userEmail;

    private UUID equipmentId;
    private String equipmentName;
    private String equipmentLocation;
    private String categoryName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
