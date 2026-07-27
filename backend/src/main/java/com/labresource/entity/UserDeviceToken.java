package com.labresource.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * An FCM registration token for one device belonging to one user.
 *
 * <p>Stored per device rather than per user because a researcher may be logged in on a laptop
 * and a phone at once, and both should receive an alert. Tokens are rotated by FCM and revoked
 * when an app is uninstalled, so {@code PushNotificationService} deletes any token FCM reports
 * as unregistered.
 */
@Entity
@Table(name = "user_device_token",
        uniqueConstraints = @UniqueConstraint(name = "uk_device_token", columnNames = "token"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_token_id")
    private Long deviceTokenId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    /** FCM registration token — long, opaque, and unique per device install. */
    @Column(nullable = false, length = 512)
    private String token;

    /** WEB | ANDROID | IOS — informational, used when debugging delivery. */
    @Column(length = 20)
    private String platform;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        lastSeenAt = now;
    }
}
