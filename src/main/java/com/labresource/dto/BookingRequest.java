package com.labresource.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BookingRequest {
    private Long equipmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}