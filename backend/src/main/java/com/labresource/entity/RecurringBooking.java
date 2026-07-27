package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Recurring booking series (EER: recurring_booking).
 * Individual Booking rows are generated per occurrence and link back here,
 * so approval/cancellation/audit still work per-occurrence.
 */
@Entity
@Table(name = "recurring_booking", indexes = {
    @Index(name = "idx_recurring_booking_user", columnList = "user_id"),
    @Index(name = "idx_recurring_booking_equipment", columnList = "equipment_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recurring_id")
    private Long recurringId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(nullable = false, length = 20)
    private String frequency; // DAILY | WEEKLY

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(nullable = false, length = 20)
    private String status; // ACTIVE | CANCELLED

    @Column(name = "occurrences_created")
    private Integer occurrencesCreated;

    @Column(name = "occurrences_skipped")
    private Integer occurrencesSkipped;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }
}
