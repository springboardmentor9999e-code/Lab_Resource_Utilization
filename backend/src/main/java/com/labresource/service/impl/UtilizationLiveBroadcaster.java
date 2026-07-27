package com.labresource.service.impl;

import com.labresource.config.UtilizationWebSocketHandler;
import com.labresource.event.BookingStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * Turns booking status changes into live dashboard updates — the "real-time" half of real-time
 * utilization monitoring, which previously only refreshed when a user reloaded the page.
 *
 * Bound to {@link TransactionPhase#AFTER_COMMIT} so a dashboard is never told about a transition
 * that then rolls back. The trade is a small delay versus announcing something untrue, which for a
 * monitoring view is the wrong way round.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UtilizationLiveBroadcaster {

    /**
     * Only transitions that move the utilization needle are worth a push. PENDING creation does
     * not: an unapproved request occupies no capacity, and broadcasting it would make the live
     * figures disagree with the summary endpoint, which counts only confirmed usage.
     */
    private static final Set<String> BROADCAST_STATUSES =
            Set.of("CONFIRMED", "IN_USE", "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW");

    private final UtilizationWebSocketHandler socketHandler;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        if (!BROADCAST_STATUSES.contains(event.getNewStatus())) {
            return;
        }

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bookingId", event.getBookingId());
        payload.put("equipmentId", event.getEquipmentId());
        payload.put("oldStatus", event.getOldStatus());
        payload.put("newStatus", event.getNewStatus());
        payload.put("bookingDate", String.valueOf(event.getBookingDate()));
        payload.put("startTime", String.valueOf(event.getStartTime()));
        payload.put("endTime", String.valueOf(event.getEndTime()));

        socketHandler.broadcast("UTILIZATION_CHANGED", payload);
    }

    /**
     * Fallback for events published outside a transaction. Without this, a status change made from
     * a non-transactional path would silently never reach any dashboard.
     */
    @EventListener
    public void onBookingStatusChangedWithoutTransaction(BookingStatusChangedEvent event) {
        // TransactionalEventListener already handled it if a transaction was active
        if (org.springframework.transaction.support.TransactionSynchronizationManager
                .isActualTransactionActive()) {
            return;
        }
        onBookingStatusChanged(event);
    }
}
