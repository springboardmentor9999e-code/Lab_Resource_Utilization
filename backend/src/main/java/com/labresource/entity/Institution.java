package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "institution")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institution_id")
    private Long institutionId;
    
    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;
    
    @Column(name = "email", length = 150)
    private String email;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "address", length = 255)
    private String address;
    
    @Column(name = "website", length = 150)
    private String website;
    
    @Column(name = "is_active")
    private Boolean isActive;

    /**
     * Institution-wide utilization rate target (0-100). Acts as the default any department
     * without its own target is measured against.
     */
    @Column(name = "utilization_target_percent")
    private Double utilizationTargetPercent;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "institution")
    private Set<Department> departments = new HashSet<>();
    
    @OneToMany(mappedBy = "institution")
    private Set<AppUser> users = new HashSet<>();
    
}