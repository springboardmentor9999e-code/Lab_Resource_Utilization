package com.rems.entity;

import com.rems.enums.SharingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "institution_sharing_agreements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionSharingAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sharing_id")
    private Long sharingId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requester_institution_id", nullable = false)
    private Institution requesterInstitution;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_institution_id", nullable = false)
    private Institution targetInstitution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SharingStatus status;

    @Column(name = "terms_accepted", nullable = false)
    private Boolean termsAccepted;

    @Column(name = "purpose", columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = SharingStatus.PENDING;
        }
        if (this.termsAccepted == null) {
            this.termsAccepted = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
