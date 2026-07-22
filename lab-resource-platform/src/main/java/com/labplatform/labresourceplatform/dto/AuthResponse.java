package com.labplatform.labresourceplatform.dto;

import com.labplatform.labresourceplatform.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private String tokenType = "Bearer";

    private Long userId;

    private String name;

    private String email;

    private Role role;

    private Long institutionId;

    public AuthResponse(String token, Long userId, String name, String email, Role role, Long institutionId) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.institutionId = institutionId;
    }
}
