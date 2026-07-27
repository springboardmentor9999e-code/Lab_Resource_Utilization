package com.labresource.service.impl;

import com.labresource.entity.Booking;
import com.labresource.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Day-before booking reminder (18:00 local).
 * Reminds each user of their confirmed bookings scheduled for the next day,
 * in-app + email. Runs once daily so a given booking is reminded exactly once.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingReminderJob {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 0 18 * * *")
    @Transactional
    public void sendTomorrowReminders() {
        try {
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            List<Booking> bookings = bookingRepository.findConfirmedOnDate(tomorrow);
            if (bookings.isEmpty()) {
                return;
            }

            for (Booking b : bookings) {
                String message = "Reminder: your booking for "
                        + b.getEquipment().getEquipmentName()
                        + " (" + b.getEquipment().getEquipmentCode() + ") is tomorrow, "
                        + b.getBookingDate() + " from " + b.getStartTime() + " to " + b.getEndTime()
                        + ". Please arrive on time or cancel if your plans changed.";

                // Urgent: a reminder that arrives after the slot has already been no-showed
                // has failed at its only job, so it goes out on every channel the user allows.
                notificationService.notifyUrgent(b.getUser(), "BOOKING",
                        "Upcoming Booking Reminder", message, "/dashboard/bookings",
                        "Reminder: " + b.getEquipment().getEquipmentName() + " booked tomorrow "
                                + b.getBookingDate() + " " + b.getStartTime() + "-" + b.getEndTime() + ".");
            }
            log.info("Sent {} booking reminders for {}", bookings.size(), tomorrow);
        } catch (Exception ex) {
            log.error("Booking reminder run failed: {}", ex.getMessage());
        }
    }
}
