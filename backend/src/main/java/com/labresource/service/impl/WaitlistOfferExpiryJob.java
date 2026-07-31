package com.labresource.service.impl;

import com.labresource.service.interfaces.WaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Releases waitlist offers whose claim window has lapsed and passes each slot to the next in line.
 *
 * <p>Every 15 minutes rather than daily: offer windows are measured in hours, so a daily sweep
 * would leave a freed slot idle for most of a day — the exact stall this job prevents.
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
            // A failed sweep must not kill the scheduler thread; the next run retries
            log.error("Waitlist offer expiry sweep failed: {}", ex.getMessage(), ex);
        }
    }
}
