package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Calibration / certification record (EER: equipment_calibration).
 * nextDueDate drives the certification renewal reminders.
 */
@Entity
@Table(name = "equipment_calibration", indexes = {
    @Index(name = "idx_equipment_calibration_equipment", columnList = "equipment_id"),
    @Index(name = "idx_equipment_calibration_due", columnList = "next_due_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentCalibration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calibration_id")
    private Long calibrationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "calibration_date", nullable = false)
    private LocalDate calibrationDate;

    @Column(name = "next_due_date", nullable = false)
    private LocalDate nextDueDate;

    @Column(name = "certificate_number", length = 100)
    private String certificateNumber;

    @Column(name = "calibrated_by", length = 150)
    private String calibratedBy; // external agency or technician name

    @Column(length = 500)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private AppUser createdBy;

    // Set once the daily reminder for this record has been sent (avoid duplicates)
    @Column(name = "reminder_sent")
    private Boolean reminderSent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (reminderSent == null) reminderSent = false;
    }
}
