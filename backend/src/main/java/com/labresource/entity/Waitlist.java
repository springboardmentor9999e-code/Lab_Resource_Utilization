package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "waitlist", indexes = {
        @Index(name = "idx_waitlist_equipment", columnList = "equipment_id"),
        @Index(name = "idx_waitlist_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Waitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "waitlist_id")
    private Long waitlistId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "priority")
    private Integer priority;

    @Column(nullable = false, length = 20)
    private String status; // WAITING | NOTIFIED | CONVERTED | EXPIRED | CANCELLED

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;

    /**
     * When a NOTIFIED user's claim on the freed slot lapses. Without this the queue stalls:
     * promotion only ever picks a WAITING entry, so a notified user who never books would hold
     * the head of the queue permanently and nobody behind them could be offered the slot.
     */
    @Column(name = "offer_expires_at")
    private LocalDateTime offerExpiresAt;

    @PrePersist
    public void prePersist() {
        requestedAt = LocalDateTime.now();
        if (status == null) {
            status = "WAITING";
        }
        if (priority == null) {
            priority = 0;
        }
    }
}
