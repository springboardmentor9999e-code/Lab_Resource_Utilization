package com.labplatform.labresourceplatform.entity;

import com.labplatform.labresourceplatform.enums.SharingRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sharing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "requester_institution_id")
    private Institution requesterInstitution;

    @ManyToOne
    @JoinColumn(name = "owner_institution_id")
    private Institution ownerInstitution;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    private SharingRequestStatus status;

    private String purpose;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        status = SharingRequestStatus.PENDING;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}