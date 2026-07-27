package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "sharing_request", indexes = {
    @Index(name = "idx_sharing_request_equipment", columnList = "equipment_id"),
    @Index(name = "idx_sharing_request_from_institution", columnList = "from_institution_id"),
    @Index(name = "idx_sharing_request_to_institution", columnList = "to_institution_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sharing_request_id")
    private Long sharingRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // Requester's institution
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_institution_id", nullable = false)
    private Institution fromInstitution;

    // Equipment owner's institution
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_institution_id", nullable = false)
    private Institution toInstitution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private AppUser requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private AppUser approvedBy;

    /**
     * The standing agreement this request was made under, if one was effective at the time.
     * Recorded rather than re-derived so that later changing or terminating an agreement does not
     * rewrite the terms of requests already granted under it — and so quota accounting and
     * partnership reporting have something concrete to count.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id")
    private SharingAgreement agreement;

    @Column(nullable = false, length = 500)
    private String purpose;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED
    @Column(nullable = false, length = 30)
    private String status;

    @Column(length = 255)
    private String remarks;

    // Usage fee snapshot: equipment hourlyRate at request time (rate can change later)
    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private java.math.BigDecimal hourlyRate;

    // hourlyRate x requested duration, less any agreement discount, fixed at request time
    @Column(name = "estimated_fee", precision = 12, scale = 2)
    private java.math.BigDecimal estimatedFee;

    // Discount applied from the governing agreement, snapshotted alongside the fee
    @Column(name = "discount_percent", precision = 5, scale = 2)
    private java.math.BigDecimal discountPercent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
