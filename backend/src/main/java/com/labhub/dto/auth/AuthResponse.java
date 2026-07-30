package com.labhub.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Authentication response DTO containing JWT token and user info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long expiresIn;
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private List<String> roles;
    private String departmentId;
    private String departmentName;
    private String institutionId;
    private String institutionName;
}
