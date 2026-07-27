package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "app_user", indexes = {
    @Index(name = "idx_app_user_institution", columnList = "institution_id"),
    @Index(name = "idx_app_user_department", columnList = "department_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    @Column(nullable = false, unique = true, length = 100)
    private String username;
    
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;
    
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;
    
    @Column(length = 20)
    private String phone;
    
    @Column(length = 10)
    private String gender;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    @Column(name = "auth_provider", length = 20)
    private String authProvider; // LOCAL | GOOGLE

    // Channel opt-outs. Null means "never chosen" and is treated as enabled, so rows that
    // predate these columns keep receiving alerts instead of silently going dark.
    @Column(name = "sms_notifications_enabled")
    private Boolean smsNotificationsEnabled;

    @Column(name = "push_notifications_enabled")
    private Boolean pushNotificationsEnabled;

    @Column(name = "is_active")
    private Boolean isActive;
    
    @Column(name = "is_verified")
    private Boolean isVerified;
    
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserRole> userRoles = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<RefreshToken> refreshTokens = new HashSet<>();
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<PasswordResetToken> passwordResetTokens = new HashSet<>();
    
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        if (isActive == null)
            isActive = true;
        
        if (isVerified == null)
            isVerified = false;
            
        if (status == null)
            status = UserStatus.ACTIVE;

        if (authProvider == null)
            authProvider = "LOCAL";
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
}