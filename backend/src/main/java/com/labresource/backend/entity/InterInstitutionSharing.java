package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "inter_institution_sharing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class InterInstitutionSharing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sharingId;

    // LABORATORY or EQUIPMENT
    @Column(nullable = false)
    private String resourceType;

    @ManyToOne
    @JoinColumn(name = "laboratory_id")
    private Laboratory laboratory;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    // Institution providing the resource
    @ManyToOne
    @JoinColumn(name = "from_institution_id", nullable = false)
    private Institution fromInstitution;

    // Institution allowed to use the resource
    @ManyToOne
    @JoinColumn(name = "to_institution_id", nullable = false)
    private Institution toInstitution;

    private Integer sharedQuantity;

    private LocalDate availableFrom;

    private LocalDate availableTo;

    private String status;

    private String remarks;
}