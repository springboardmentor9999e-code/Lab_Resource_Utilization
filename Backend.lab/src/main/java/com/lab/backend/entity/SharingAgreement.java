package com.lab.backend.entity;

import com.lab.backend.enums.SharingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sharing_agreements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SharingAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String agreementNumber;

    @ManyToOne
    @JoinColumn(name = "provider_laboratory_id", nullable = false)
    private Laboratory providerLaboratory;

    @ManyToOne
    @JoinColumn(name = "requesting_laboratory_id", nullable = false)
    private Laboratory requestingLaboratory;

    private LocalDate startDate;
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String terms;

    private Integer sharingQuota;

    @Enumerated(EnumType.STRING)
    private SharingStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = SharingStatus.PENDING;
        }
    }
}
