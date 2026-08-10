package com.example.backend.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String name;
    private Integer userId;

    public AuthResponse(
            String token,
            String role,
            String name,
            Integer userId
    ) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public Integer getUserId() {
        return userId;
    }
}