package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Milestone 3, task 3: itemized inter-institution billing. One row per
// completed booking where the requester's institution differs from the
// equipment-owning institution - this is the "charge" that results from a
// cross-institution sharing arrangement (whether it went through a
// SharingRequest or was auto-logged from a direct booking - see
// BookingService.logSharingRequestIfCrossInstitution for the equivalent
// audit-trail concept this reuses).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "billing_records")
public class BillingRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "billing_record_id")
    private Long billingRecordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // The institution being charged (the requester/user's institution).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billed_institution_id", nullable = false)
    private Institution billedInstitution;

    // The institution that owns the equipment and is owed payment.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_institution_id", nullable = false)
    private Institution ownerInstitution;

    // Snapshot of the equipment's hourly rate AT THE TIME this record was
    // generated - stored rather than recomputed later, so a rate change
    // afterward doesn't retroactively alter a past bill.
    @Column(name = "hourly_rate", nullable = false)
    private BigDecimal hourlyRate;

    @Column(name = "hours_used", nullable = false)
    private BigDecimal hoursUsed;

    @Column(name = "total_cost", nullable = false)
    private BigDecimal totalCost;

    // 'Pending', 'Invoiced', 'Paid' - kept as a plain string, consistent with
    // how Booking/Maintenance/SharingRequest statuses are handled elsewhere in
    // this codebase, rather than introducing a new enum for a 3-value field.
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = "Pending";
        }
    }
}
