package com.labplatform.labresourceplatform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "equipment_id")
    private Long equipmentId;

    @Column(name = "equipment_name", nullable = false, length = 100)
    private String equipmentName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "specification")
    private String specification;

    // Matches the DB CHECK constraint values exactly:
    // 'Available', 'Booked', 'Under Maintenance', 'Out of Service', 'Retired'
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "documentation_url")
    private String documentationUrl;

    // Milestone 3, task 3 (cost tracking & inter-institution billing): what it
    // costs, per hour of use, to book this equipment. Nullable - equipment
    // added before this field existed, or equipment an institution doesn't
    // charge for, simply has no rate and generates no billing records.
    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_id", nullable = false)
    private Lab lab;
}
