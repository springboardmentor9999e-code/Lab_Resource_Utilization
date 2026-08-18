package com.lab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "booking_optimization_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingOptimizationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;
    
    private LocalDateTime optimizationTimestamp;
    private Integer slotsOptimized;
    private Integer overlappingBookingsDetected;
    private BigDecimal efficiencyScore;
    
    @PrePersist
    public void prePersist() {
        optimizationTimestamp = LocalDateTime.now();
    }
}
