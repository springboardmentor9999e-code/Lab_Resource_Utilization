package com.lab.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_cost")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private String equipmentCode;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private BigDecimal monthlyCost;

    @Column(nullable = false)
    private LocalDate costEffectiveDate;

    @Column
    private String description;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, DEPRECATED

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
