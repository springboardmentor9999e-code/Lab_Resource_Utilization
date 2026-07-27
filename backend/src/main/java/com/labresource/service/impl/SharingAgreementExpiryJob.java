package com.labresource.service.impl;

import com.labresource.entity.SharingAgreement;
import com.labresource.repository.SharingAgreementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Retires sharing agreements once their end date has passed.
 *
 * The lookup that resolves an agreement for a request already filters on the date range, so an
 * expired agreement stops granting terms the moment it lapses — this job exists so the *status*
 * reflects reality too, and admins are not left reading "ACTIVE" against an agreement that ended
 * last month.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SharingAgreementExpiryJob {

    private final SharingAgreementRepository sharingAgreementRepository;

    /** Daily, shortly after the other morning sweeps. */
    @Scheduled(cron = "0 50 7 * * *")
    @Transactional
    public void expireLapsedAgreements() {
        try {
            List<SharingAgreement> lapsed = sharingAgreementRepository.findLapsed(LocalDate.now());
            if (lapsed.isEmpty()) {
                return;
            }
            lapsed.forEach(a -> a.setStatus("EXPIRED"));
            sharingAgreementRepository.saveAll(lapsed);
            log.info("Marked {} sharing agreement(s) as EXPIRED", lapsed.size());
        } catch (Exception ex) {
            log.error("Sharing agreement expiry sweep failed: {}", ex.getMessage(), ex);
        }
    }
}
