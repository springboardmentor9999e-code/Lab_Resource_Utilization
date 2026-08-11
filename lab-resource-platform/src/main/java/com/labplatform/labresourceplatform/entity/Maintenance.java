package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maintenance_id")
    private Long maintenanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "description")
    private String description;

    // 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
    @Column(name = "status", length = 20)
    private String status;

    // 'Preventive' (routine, scheduled ahead of time) or 'Corrective' (reactive,
    // in response to a fault/breakdown) - Milestone 3's "preventive maintenance
    // scheduling" and "maintenance request and work order management" tasks
    // distinguish between these, so work orders need to record which kind this is.
    @Column(name = "work_order_type", length = 20)
    private String workOrderType;

    // The technician this work order is assigned to. Nullable - a maintenance
    // record can be logged/scheduled before anyone is assigned to carry it out.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_technician_id")
    private User assignedTechnician;

    // "Continuous"/recurring maintenance: if set, completing this record
    // automatically schedules the next occurrence this many days later,
    // rather than equipment maintenance being a one-off, easy-to-forget
    // manual action. Nullable - a one-time corrective repair has no recurrence.
    @Column(name = "recurrence_interval_days")
    private Integer recurrenceIntervalDays;

    // Set once this record's completion has generated its next occurrence, so
    // the same record never spawns a duplicate follow-up if it's saved again
    // after already being marked Completed once.
    @Column(name = "next_occurrence_generated")
    private Boolean nextOccurrenceGenerated;
}
