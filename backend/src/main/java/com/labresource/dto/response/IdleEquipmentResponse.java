package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class IdleEquipmentResponse {

    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String labName;
    private String status;
    private LocalDate lastBookingDate; // null = never booked
    private long idleDays;             // days since last booking (or since window start if never booked)
}
