package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * One line of the internal chargeback ledger: work a department consumed, priced and
 * posted against that department's budget.
 *
 * <p>The charged department is the <em>consumer's</em> department, not the equipment
 * owner's — that is what makes this a chargeback rather than a cost report. A researcher
 * from Chemistry running an instrument owned by Physics puts the cost on Chemistry's budget.
 *
 * <p>{@code booking} and {@code maintenanceRequest} are the source documents and are unique
 * where present, so replaying an event or re-running a backfill cannot double-charge.
 */
@Entity
@Table(name = "department_charge",
        indexes = {
                @Index(name = "idx_department_charge_dept", columnList = "department_id"),
                @Index(name = "idx_department_charge_date", columnList = "charge_date")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_charge_booking", columnNames = "booking_id"),
                @UniqueConstraint(name = "uk_charge_maintenance", columnNames = "maintenance_request_id")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepartmentCharge {

    public static final String TYPE_USAGE = "USAGE";
    public static final String TYPE_MAINTENANCE = "MAINTENANCE";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charge_id")
    private Long chargeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    /** Who incurred the charge. Null for maintenance, which is charged to the department at large. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_request_id")
    private MaintenanceRequest maintenanceRequest;

    /** USAGE | MAINTENANCE */
    @Column(name = "charge_type", nullable = false, length = 20)
    private String chargeType;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /** Billable hours behind a usage charge; null for maintenance. */
    @Column(name = "hours")
    private Double hours;

    @Column(name = "charge_date", nullable = false)
    private LocalDate chargeDate;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (chargeDate == null) chargeDate = LocalDate.now();
    }
}
