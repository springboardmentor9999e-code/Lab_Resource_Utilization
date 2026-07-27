package com.labresource.service.impl;

import com.labresource.service.interfaces.WaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Releases waitlist offers whose claim window has lapsed and passes each slot to the next person
 * in line.
 *
 * Runs every 15 minutes rather than daily: an offer window is measured in hours, so a once-a-day
 * sweep would leave a slot idle for most of a day after its claim ran out — which is the very
 * stall this job exists to prevent.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WaitlistOfferExpiryJob {

    private final WaitlistService waitlistService;

    @Scheduled(cron = "0 */15 * * * *")
    public void sweepLapsedOffers() {
        try {
            int released = waitlistService.expireLapsedOffers();
            if (released > 0) {
                log.info("Waitlist sweep: released {} lapsed offer(s) to the next in line", released);
            }
        } catch (Exception ex) {
            // A failed sweep must not kill the scheduler thread — the next run will retry
            log.error("Waitlist offer expiry sweep failed: {}", ex.getMessage(), ex);
        }
    }
}
