package com.labhub.entity;

import com.labhub.enums.PartnershipStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "partnerships", indexes = {
        @Index(name = "idx_partnership_requester", columnList = "requester_institution_id"),
        @Index(name = "idx_partnership_target", columnList = "target_institution_id"),
        @Index(name = "idx_partnership_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Partnership extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_institution_id", nullable = false)
    private Institution requesterInstitution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_institution_id", nullable = false)
    private Institution targetInstitution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PartnershipStatus status = PartnershipStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
