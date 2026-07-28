package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilitySlotResponse {

    private Long equipmentId;
    private String equipmentName;
    private LocalDate date;
    private LocalTime dayStart;
    private LocalTime dayEnd;
    private List<TimeSlot> availableSlots;
    private List<BookedSlot> bookedSlots;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSlot {
        private LocalTime start;
        private LocalTime end;
        private int durationMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookedSlot {
        private LocalTime start;
        private LocalTime end;
        private String status;
        private String bookedBy;
    }
}
