package com.labresource.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private Long institutionId;
    private String token;
    private String message;

    public LoginResponse(
            Long userId,
            String fullName,
            String email,
            String role,
            Long institutionId,
            String token,
            String message
    ) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.institutionId = institutionId;
        this.token = token;
        this.message = message;
    }
}