package com.labplatform.labresourceplatform.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.labplatform.labresourceplatform.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    // WRITE_ONLY: accepted in incoming request bodies (e.g. create/update user,
    // register, login) but never included in outgoing JSON - every endpoint that
    // returns a User (directly, or nested like RoleChangeRequest.user or
    // Booking.user) would otherwise leak the bcrypt hash to any authenticated caller.
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;
}