package com.labresource.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "equipment_certifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long certificationId;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(nullable = false)
    private String certificateType;

    @Column(nullable = false)
    private String certificateNumber;

    @Column(nullable = false)
    private String issuedBy;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private LocalDate lastCalibrationDate;

    private LocalDate nextCalibrationDate;

    private String status;

    private String documentPath;

    @Column(length = 500)
    private String remarks;
}