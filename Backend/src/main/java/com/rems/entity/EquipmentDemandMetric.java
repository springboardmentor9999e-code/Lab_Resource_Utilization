package com.rems.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "equipment_demand_metrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDemandMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "period_type", nullable = false, length = 10)
    private String periodType; // '7d' or '30d'

    @Column(name = "booking_requests", nullable = false)
    private Long bookingRequests;

    @Column(name = "rejected_bookings", nullable = false)
    private Long rejectedBookings;

    @Column(name = "waitlist_entries", nullable = false)
    private Long waitlistEntries;

    @Column(name = "avg_waitlist_wait_hours", nullable = false)
    private Double avgWaitlistWaitHours;

    @Column(name = "avg_lead_time_hours", nullable = false)
    private Double avgLeadTimeHours;

    @Column(name = "demand_score", nullable = false)
    private Double demandScore;
}
