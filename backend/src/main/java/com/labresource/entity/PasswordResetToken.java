package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token", indexes = {
    @Index(name = "idx_password_reset_token_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id")
    private Long tokenId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;
    
    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "otp", length = 6)
    private String otp;

    @Column(name = "otp_verified")
    private Boolean otpVerified;

    @Column(name = "attempts")
    private Integer attempts;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used")
    private Boolean used;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
}