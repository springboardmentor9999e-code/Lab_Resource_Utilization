package com.rems.service;

import com.rems.entity.Booking;
import com.rems.enums.BookingStatus;
import com.rems.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class DueDateReminderScheduler {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    // Run every day at 8:00 AM UTC (and run once at startup 30s after launch)
    @Scheduled(cron = "0 0 8 * * *")
    @Scheduled(initialDelay = 30000, fixedRate = 86400000)
    public void checkAndSendDueDateReminders() {
        log.info("[DUE DATE SCHEDULER] Checking for active bookings due for return today...");

        Instant now = Instant.now();
        Instant endOfToday = now.plus(24, ChronoUnit.HOURS);

        List<Booking> activeBookings = bookingRepository.findByStatusIn(List.of(
                BookingStatus.CONFIRMED,
                BookingStatus.IN_USE
        ));

        int reminderCount = 0;
        for (Booking booking : activeBookings) {
            if (booking.getEndTime() != null && booking.getEndTime().isBefore(endOfToday)) {
                if (booking.getUser() != null) {
                    notificationService.sendEquipmentDueDateReminder(booking.getUser(), booking);
                    reminderCount++;
                }
            }
        }

        log.info("[DUE DATE SCHEDULER] Successfully processed {} due date reminders.", reminderCount);
    }
}
