package com.lab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.lab.backend.enums.WaitlistStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Waitlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private LocalDateTime requestDate;
    private LocalDate desiredStartDate;
    private LocalDate desiredEndDate;
    private Integer priority;  // 0=normal, 1=high, 2=urgent
    
    @Enumerated(EnumType.STRING)
    private WaitlistStatus status;
    
    private Integer positionInQueue;
    
    @PrePersist
    public void prePersist() {
        requestDate = LocalDateTime.now();
        if (status == null) {
            status = WaitlistStatus.WAITING;
        }
        if (priority == null) {
            priority = 0;
        }
    }
}
