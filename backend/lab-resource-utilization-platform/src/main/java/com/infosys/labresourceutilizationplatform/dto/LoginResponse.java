package com.infosys.labresourceutilizationplatform.dto;

public class LoginResponse {

    private String message;
    private String token;
    private Integer userId;
    private String fullName;
    private String email;
    private String role;

    public LoginResponse(String message) {
        this.message = message;
    }

    public LoginResponse(String token, Integer userId, String fullName, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}