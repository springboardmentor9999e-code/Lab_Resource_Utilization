package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Milestone 3, task 2: calibration tracking and certification renewal
// reminders. Modeled as its own history table (like Maintenance) rather than a
// single "next due date" field on Equipment, so past calibrations stay on
// record - useful for audits and for showing a full certification history per
// piece of equipment, not just "when is it next due."
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "calibration_records")
public class CalibrationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "calibration_record_id")
    private Long calibrationRecordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    // When this calibration/certification was actually performed.
    @Column(name = "calibrated_date", nullable = false)
    private LocalDate calibratedDate;

    // When the resulting certification expires and the equipment needs
    // recalibrating - this is what renewal reminders are calculated against.
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    // Free-text name of the certifying body/standard (e.g. "ISO 17025", "NIST
    // traceability") - kept as a plain string rather than an enum since
    // certification schemes vary widely by equipment type and institution.
    @Column(name = "certification_standard", length = 150)
    private String certificationStandard;

    // Link to a hosted certificate document (same pattern as
    // Equipment.documentationUrl) - the actual file lives in external storage
    // (S3/Cloudinary/etc), this just stores the link.
    @Column(name = "certificate_url")
    private String certificateUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private User performedBy;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
