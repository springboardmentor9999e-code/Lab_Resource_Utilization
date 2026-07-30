package com.labhub.entity;

import com.labhub.enums.EquipmentSharingStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "equipment_sharings", indexes = {
        @Index(name = "idx_sharing_equipment", columnList = "equipment_id"),
        @Index(name = "idx_sharing_owning_inst", columnList = "owning_institution_id"),
        @Index(name = "idx_sharing_requesting_inst", columnList = "requesting_institution_id"),
        @Index(name = "idx_sharing_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EquipmentSharing extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owning_institution_id", nullable = false)
    private Institution owningInstitution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requesting_institution_id", nullable = false)
    private Institution requestingInstitution;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EquipmentSharingStatus status = EquipmentSharingStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_id")
    private User approvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
