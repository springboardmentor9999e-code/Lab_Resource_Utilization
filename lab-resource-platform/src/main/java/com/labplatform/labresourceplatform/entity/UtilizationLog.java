package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Records a single usage session for a piece of equipment.
// Populated when a booking is marked "Completed" (actual usage), which lets us
// calculate utilization rate = actual used time / available time.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utilization_logs")
public class UtilizationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utilization_log_id")
    private Long utilizationLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // Optional link back to the booking that generated this usage record.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(name = "usage_start", nullable = false)
    private LocalDateTime usageStart;

    @Column(name = "usage_end", nullable = false)
    private LocalDateTime usageEnd;

    // Minutes of actual use in this session, stored so we don't recompute repeatedly.
    @Column(name = "duration_minutes", nullable = false)
    private Long durationMinutes;

    // When this log was actually recorded (e.g. when the booking was marked
    // Completed), as opposed to usageStart/usageEnd which reflect the *scheduled*
    // slot. Heatmap/idle queries filter on this instead of usageStart/usageEnd so
    // a booking completed today always shows up in a "last 30 days" query window,
    // even if its scheduled slot was outside that window (item #4 of the fixes spec).
    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    public void prePersist() {
        if (this.recordedAt == null) {
            this.recordedAt = LocalDateTime.now();
        }
    }
}
