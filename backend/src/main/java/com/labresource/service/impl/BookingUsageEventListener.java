package com.labresource.service.impl;

import com.labresource.entity.AppUser;
import com.labresource.entity.Booking;
import com.labresource.entity.Equipment;
import com.labresource.entity.EquipmentUsage;
import com.labresource.event.BookingStatusChangedEvent;
import com.labresource.repository.EquipmentUsageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Records equipment usage sessions from booking status transitions.
 * Failures are logged and swallowed — usage monitoring must never break the booking flow.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingUsageEventListener {

    private final EquipmentUsageRepository equipmentUsageRepository;
    private final EntityManager entityManager;

    @EventListener
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        try {
            if ("IN_USE".equals(event.getNewStatus())) {
                openUsage(event);
            } else if ("COMPLETED".equals(event.getNewStatus())) {
                closeUsage(event);
            }
        } catch (Exception ex) {
            log.error("Failed to record equipment usage for booking {} ({} -> {}): {}",
                    event.getBookingId(), event.getOldStatus(), event.getNewStatus(), ex.getMessage(), ex);
        }
    }

    private void openUsage(BookingStatusChangedEvent event) {
        LocalDateTime scheduledStart = LocalDateTime.of(event.getBookingDate(), event.getStartTime());
        LocalDateTime start = scheduledStart.isAfter(LocalDateTime.now()) ? LocalDateTime.now() : scheduledStart;

        EquipmentUsage usage = EquipmentUsage.builder()
                .equipment(entityManager.getReference(Equipment.class, event.getEquipmentId()))
                .booking(entityManager.getReference(Booking.class, event.getBookingId()))
                .user(entityManager.getReference(AppUser.class, event.getUserId()))
                .startTime(start)
                .build();
        equipmentUsageRepository.save(usage);
    }

    private void closeUsage(BookingStatusChangedEvent event) {
        equipmentUsageRepository
                .findFirstByBooking_BookingIdAndEndTimeIsNullOrderByStartTimeDesc(event.getBookingId())
                .ifPresent(usage -> {
                    LocalDateTime end = LocalDateTime.now();
                    if (!end.isAfter(usage.getStartTime())) {
                        end = usage.getStartTime().plusMinutes(1);
                    }
                    usage.setEndTime(end);
                    usage.setUsageDurationMin((int) Duration.between(usage.getStartTime(), end).toMinutes());
                    equipmentUsageRepository.save(usage);
                });
    }
}
