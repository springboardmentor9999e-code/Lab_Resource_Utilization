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
 * Turns booking status changes into live dashboard updates.
 *
 * <p>Bound to {@link TransactionPhase#AFTER_COMMIT} so a dashboard is never told about a
 * transition that then rolls back.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UtilizationLiveBroadcaster {

    /**
     * PENDING is excluded: an unapproved request occupies no capacity, so broadcasting it would
     * make the live figures disagree with the summary endpoint, which counts confirmed usage only.
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

    /** Fallback for events published outside a transaction, which AFTER_COMMIT never sees. */
    @EventListener
    public void onBookingStatusChangedWithoutTransaction(BookingStatusChangedEvent event) {
        if (org.springframework.transaction.support.TransactionSynchronizationManager
                .isActualTransactionActive()) {
            return;
        }
        onBookingStatusChanged(event);
    }
}
