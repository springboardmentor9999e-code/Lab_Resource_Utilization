package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "department", indexes = {
    @Index(name = "idx_department_institution", columnList = "institution_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;
    
    @Column(name = "name", nullable = false, length = 150)
    private String name;
    
    @Column(name = "code", nullable = false, length = 30)
    private String code;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "is_active")
    private Boolean isActive;

    /**
     * Utilization rate (0-100) this department is expected to hit. Null means no target has been
     * set, in which case reporting falls back to the parent institution's target rather than
     * inventing one — an unset target must not read as a target of zero.
     */
    @Column(name = "utilization_target_percent")
    private Double utilizationTargetPercent;

    @Column(name = "annual_budget", precision = 14, scale = 2)
    private BigDecimal annualBudget;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "department")
    private Set<AppUser> users = new HashSet<>();
    
}