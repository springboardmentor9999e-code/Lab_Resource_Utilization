package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long equipmentId;

    @Column(nullable = false)
    private String equipmentName;

    @Column(nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WaitlistStatus status;

    private LocalDateTime notifiedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}