package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Preventive maintenance schedule (EER: maintenance_schedule).
 * A daily job creates an OPEN PREVENTIVE work order when nextDueDate arrives,
 * then advances nextDueDate by intervalDays.
 */
@Entity
@Table(name = "maintenance_schedule", indexes = {
    @Index(name = "idx_maintenance_schedule_equipment", columnList = "equipment_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    @Column(nullable = false, length = 20)
    private String maintenanceType; // PREVENTIVE | CALIBRATION | INSPECTION

    @Column(name = "interval_days", nullable = false)
    private Integer intervalDays; // e.g. 30, 90, 180, 365

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "last_generated_date")
    private LocalDate lastGeneratedDate;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
    }
}
