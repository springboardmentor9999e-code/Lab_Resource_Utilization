package com.labresource.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Published by BookingServiceImpl whenever a booking changes status.
 * Consumed by the Utilization Monitoring module to record equipment usage
 * sessions without coupling the two services.
 */
@Getter
@AllArgsConstructor
@Builder
public class BookingStatusChangedEvent {

    private final Long bookingId;
    private final Long equipmentId;
    private final Long userId;
    private final String oldStatus;
    private final String newStatus;
    private final LocalDate bookingDate;
    private final LocalTime startTime;
    private final LocalTime endTime;
}
