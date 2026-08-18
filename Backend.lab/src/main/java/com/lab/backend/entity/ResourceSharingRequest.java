package com.lab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.lab.backend.enums.SharingStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_sharing_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceSharingRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;
    
    @ManyToOne
    @JoinColumn(name = "requesting_laboratory_id", nullable = false)
    private Laboratory requestingLaboratory;
    
    @ManyToOne
    @JoinColumn(name = "provider_laboratory_id", nullable = false)
    private Laboratory providerLaboratory;
    
    private LocalDateTime requestDate;
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Enumerated(EnumType.STRING)
    private SharingStatus status;
    
    private String purpose;
    
    @PrePersist
    public void prePersist() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = SharingStatus.PENDING;
        }
    }
}
