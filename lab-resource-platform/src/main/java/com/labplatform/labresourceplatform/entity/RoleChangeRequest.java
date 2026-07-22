package com.labplatform.labresourceplatform.entity;

import com.labplatform.labresourceplatform.enums.Role;
import com.labplatform.labresourceplatform.enums.RoleChangeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// Records a user's request to be elevated from their default self-registered
// role (STUDENT/RESEARCHER) to a staff role. Created automatically during
// registration when the requested role differs from the default; reviewed by
// an INSTITUTION_ADMINISTRATOR (own institution) or SYSTEM_ADMINISTRATOR (any).
@Entity
@Table(name = "role_change_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_change_request_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_role", nullable = false, length = 50)
    private Role requestedRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private RoleChangeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = RoleChangeStatus.PENDING;
        }
    }
}
