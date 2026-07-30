package com.labhub.entity;

import com.labhub.enums.InstitutionStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "institutions", indexes = {
        @Index(name = "idx_institution_code", columnList = "code"),
        @Index(name = "idx_institution_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Institution extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "code", unique = true)
    private String code;

    @Column(name = "type")
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private InstitutionStatus status = InstitutionStatus.APPROVED;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_admin_name")
    private String primaryAdminName;

    @Column(name = "primary_admin_email")
    private String primaryAdminEmail;

    @OneToMany(mappedBy = "institution", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Department> departments = new ArrayList<>();
}

