package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_role", indexes = {
    @Index(name = "idx_user_role_user", columnList = "user_id"),
    @Index(name = "idx_user_role_role", columnList = "role_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {
    
    @EmbeddedId
    private UserRoleId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private AppUser user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roleId")
    @JoinColumn(name = "role_id")
    private Role role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
}