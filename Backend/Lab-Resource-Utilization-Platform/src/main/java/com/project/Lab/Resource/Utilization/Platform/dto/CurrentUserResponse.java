package com.project.Lab.Resource.Utilization.Platform.dto;

public class CurrentUserResponse {

    private Integer userId;
    private Integer institutionId;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String phone;
    private String role;

    public CurrentUserResponse() {
    }

    public CurrentUserResponse(
            Integer userId,
            Integer institutionId,
            String firstName,
            String lastName,
            String name,
            String email,
            String phone,
            String role
    ) {
        this.userId = userId;
        this.institutionId = institutionId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public Integer getUserId() {
        return userId;
    }

    public Integer getInstitutionId() {
        return institutionId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }
}