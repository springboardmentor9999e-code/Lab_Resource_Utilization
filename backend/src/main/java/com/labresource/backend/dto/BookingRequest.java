package com.labresource.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class BookingRequest {


    private Long labId;

    private Long equipmentId;

    private Integer quantity;
    
    private LocalDate bookingDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String purpose;
    
    private Long institutionId;

}