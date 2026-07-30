package com.labhub.entity;

import com.labhub.enums.WaitlistStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlists", indexes = {
        @Index(name = "idx_waitlist_user", columnList = "user_id"),
        @Index(name = "idx_waitlist_equipment", columnList = "equipment_id"),
        @Index(name = "idx_waitlist_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Waitlist extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private WaitlistStatus status = WaitlistStatus.WAITING;

    @Column(name = "notified_at")
    private LocalDateTime notifiedAt;
}
