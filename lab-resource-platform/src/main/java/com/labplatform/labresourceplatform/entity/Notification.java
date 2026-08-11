package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// In-app alert system (Milestone 3, task 7 / mentor priority #3). Covers:
// idle equipment (unused for a week), maintenance due/overdue, calibration
// expiring/expired. Email/SMS delivery isn't wired up (would need real
// provider credentials - JavaMailSender/Twilio config), but every
// notification generated here is a ready-made hook for that later: the
// content and recipient are already resolved, only the delivery channel
// would need adding.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    // Who this notification is for.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    // 'Idle Equipment', 'Maintenance Due', 'Calibration Due' - kept as a plain
    // string like every other status field in this codebase (Booking,
    // Maintenance, SharingRequest, BillingRecord), rather than an enum, for
    // the same reasons: it's still evolving and this avoids a migration every
    // time a new alert type is added.
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    // Optional link to the equipment this notification concerns, so the UI can
    // deep-link "View equipment" from the notification itself.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}
