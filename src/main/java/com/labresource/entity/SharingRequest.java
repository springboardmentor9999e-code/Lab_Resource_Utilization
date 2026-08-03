package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sharing_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long equipmentId;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private Long ownerInstitutionId;

    @Column(nullable = false)
    private Long requestingInstitutionId;

    @Column(nullable = false)
    private String requestedBy; // email

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SharingRequestStatus status;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
