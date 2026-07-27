package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Maintenance work order (EER: maintenance_request).
 * Status flow: OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED; CANCELLED from OPEN/ASSIGNED.
 * Equipment goes UNDER_MAINTENANCE while IN_PROGRESS; downtime = startedAt..completedAt.
 */
@Entity
@Table(name = "maintenance_request", indexes = {
    @Index(name = "idx_maintenance_request_equipment", columnList = "equipment_id"),
    @Index(name = "idx_maintenance_request_status", columnList = "status"),
    @Index(name = "idx_maintenance_request_assigned", columnList = "assigned_to")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private AppUser requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private AppUser assignedTo; // lab technician

    @Column(nullable = false, length = 20)
    private String type; // PREVENTIVE | CORRECTIVE | CALIBRATION | INSPECTION

    @Column(nullable = false, length = 10)
    private String priority; // LOW | MEDIUM | HIGH | CRITICAL

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, length = 20)
    private String status; // OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "downtime_minutes")
    private Long downtimeMinutes;

    @Column(name = "resolution_notes", length = 1000)
    private String resolutionNotes;

    // Actual maintenance cost, feeds the Cost & Billing module
    @Column(precision = 12, scale = 2)
    private BigDecimal cost;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "OPEN";
        if (priority == null) priority = "MEDIUM";
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
