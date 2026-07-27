package com.labresource.service.interfaces;

import com.labresource.dto.response.WaitlistResponse;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface WaitlistService {

    WaitlistResponse joinWaitlist(Long equipmentId, LocalDate requestedDate,
                                  LocalTime startTime, LocalTime endTime, String username);

    List<WaitlistResponse> getMyWaitlist(String username);

    List<WaitlistResponse> getAllActiveEntries();

    WaitlistResponse cancelWaitlistEntry(Long waitlistId, String username, boolean isManager);

    /**
     * Slot-freeing hook — called by the booking module when a CONFIRMED/PENDING
     * slot is released (booking CANCELLED or REJECTED). Promotes the oldest
     * WAITING entry for that equipment + date to NOTIFIED and emails the user.
     */
    void notifyNextInLine(Long equipmentId, LocalDate date);

    /**
     * Called after a successful booking creation: if the user had a NOTIFIED
     * waitlist entry for the same equipment + date, mark it CONVERTED.
     */
    void markConvertedIfNotified(Long userId, Long equipmentId, LocalDate date);

    /**
     * Sweeps NOTIFIED offers whose claim window has lapsed: marks them EXPIRED and passes the
     * slot to the next person in line. Without this the queue stalls behind a notified user who
     * never books.
     *
     * @return how many lapsed offers were released
     */
    int expireLapsedOffers();
}
