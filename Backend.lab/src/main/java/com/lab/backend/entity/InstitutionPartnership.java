package com.lab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.lab.backend.enums.ApprovalStatus;
import java.time.LocalDateTime;

@Entity
@Table(name = "institution_partnerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstitutionPartnership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "initiator_laboratory_id", nullable = false)
    private Laboratory initiatorLaboratory;
    
    @ManyToOne
    @JoinColumn(name = "partner_laboratory_id", nullable = false)
    private Laboratory partnerLaboratory;
    
    private Integer sharingQuota;
    
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;
    
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (approvalStatus == null) {
            approvalStatus = ApprovalStatus.PENDING;
        }
    }
}
