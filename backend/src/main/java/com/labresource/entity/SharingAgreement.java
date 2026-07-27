package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A standing arrangement between two institutions governing how they share equipment
 * (spec Module 5(ii): "Sharing agreement and access request workflows").
 *
 * Distinct from {@link SharingRequest}, which is a single booking-level ask. An agreement is the
 * framework those asks are evaluated under: it sets the negotiated rate, an optional monthly hour
 * quota, and whether requests can skip manual approval. Without it every request is negotiated
 * from scratch and nothing records that two institutions have an ongoing relationship at all.
 *
 * Direction matters. An agreement lets users of {@code fromInstitution} book equipment owned by
 * {@code toInstitution}; a reciprocal arrangement is two rows, which keeps the terms of each
 * direction independent (a discount one way need not be matched the other).
 */
@Entity
@Table(name = "sharing_agreement", indexes = {
        @Index(name = "idx_agreement_from", columnList = "from_institution_id"),
        @Index(name = "idx_agreement_to", columnList = "to_institution_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "agreement_id")
    private Long agreementId;

    /** The institution granted access. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_institution_id", nullable = false)
    private Institution fromInstitution;

    /** The institution that owns the equipment and grants the access. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_institution_id", nullable = false)
    private Institution toInstitution;

    @Column(nullable = false, length = 150)
    private String title;

    /** PROPOSED | ACTIVE | SUSPENDED | EXPIRED | TERMINATED */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    /** Null means open-ended — the agreement runs until somebody terminates it. */
    @Column(name = "end_date")
    private LocalDate endDate;

    /** Negotiated discount off the owner's listed hourly rate, 0-100. */
    @Column(name = "discount_percent", precision = 5, scale = 2)
    private BigDecimal discountPercent;

    /** Optional cap on hours the borrowing institution may consume per calendar month. */
    @Column(name = "max_hours_per_month")
    private Integer maxHoursPerMonth;

    /**
     * When true, requests covered by this agreement are approved on submission instead of
     * queueing for a human. The point of a signed agreement is not re-litigating every booking.
     */
    @Column(name = "auto_approve")
    private Boolean autoApprove;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private AppUser approvedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (status == null) {
            status = "PROPOSED";
        }
        if (autoApprove == null) {
            autoApprove = false;
        }
        if (discountPercent == null) {
            discountPercent = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** True when the agreement is ACTIVE and today falls inside its date range. */
    @Transient
    public boolean isCurrentlyEffective() {
        if (!"ACTIVE".equals(status)) {
            return false;
        }
        LocalDate today = LocalDate.now();
        if (startDate != null && today.isBefore(startDate)) {
            return false;
        }
        return endDate == null || !today.isAfter(endDate);
    }
}
