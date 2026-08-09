package com.labresource.platform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(
        name = "maintenance_records",
        indexes = {
                @Index(name = "idx_maintenance_equipment_id", columnList = "equipment_id"),
                @Index(name = "idx_maintenance_created_by_user_id", columnList = "created_by_user_id"),
                @Index(name = "idx_maintenance_status", columnList = "status"),
                @Index(name = "idx_maintenance_scheduled_range", columnList = "scheduled_start_time,scheduled_end_time")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Equipment is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "equipment_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_maintenance_equipment")
    )
    private Equipment equipment;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title must not exceed 150 characters")
    @Column(nullable = false, length = 150)
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    @Column(length = 1000)
    private String description;

    @NotNull(message = "Status is required")
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @NotNull(message = "Scheduled start time is required")
    @Column(name = "scheduled_start_time", nullable = false)
    private LocalDateTime scheduledStartTime;

    @NotNull(message = "Scheduled end time is required")
    @Column(name = "scheduled_end_time", nullable = false)
    private LocalDateTime scheduledEndTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Size(max = 150, message = "Technician name must not exceed 150 characters")
    @Column(length = 150)
    private String technicianName;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    @Column(length = 1000)
    private String notes;

    @NotNull(message = "Created by user is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "created_by_user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_maintenance_created_by_user")
    )
    private User createdBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @AssertTrue(message = "Scheduled end time must be after scheduled start time")
    public boolean isScheduledEndTimeAfterStartTime() {
        if (scheduledStartTime == null || scheduledEndTime == null) {
            return true;
        }

        return scheduledEndTime.isAfter(scheduledStartTime);
    }
}
