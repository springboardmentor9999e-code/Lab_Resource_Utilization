package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long equipmentId;

    @Column(nullable = false)
    private String equipmentName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceType type;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate scheduledDate;

    private LocalDate completedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status;

    private String assignedTechnician; // email

    private String notes;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}