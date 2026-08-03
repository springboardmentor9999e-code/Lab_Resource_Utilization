package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role requestedRole;

    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleRequestStatus status;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
