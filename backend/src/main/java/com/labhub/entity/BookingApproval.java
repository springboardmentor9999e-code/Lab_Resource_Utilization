package com.labhub.entity;

import com.labhub.enums.ApprovalDecision;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "booking_approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class BookingApproval extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false)
    @Builder.Default
    private ApprovalDecision decision = ApprovalDecision.PENDING;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
}
