package com.infosys.labresourceutilizationplatform.dto;

public class LoginResponse {

    private String message;
    private String token;
    private Integer userId;
    private String fullName;
    private String email;
    private String role;
    private Integer institutionId;
    private Integer departmentId;

    public LoginResponse(String message) {
        this.message = message;
    }

    public LoginResponse(String token, Integer userId, String fullName, String email, String role, Integer institutionId, Integer departmentId) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.institutionId = institutionId;
        this.departmentId = departmentId;
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

    public Integer getInstitutionId() {
        return institutionId;
    }

    public Integer getDepartmentId() {
        return departmentId;
    }
}