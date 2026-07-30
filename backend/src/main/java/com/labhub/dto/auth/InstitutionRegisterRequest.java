package com.labhub.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class InstitutionRegisterRequest {

    @NotBlank(message = "Institution name is required")
    private String name;

    @NotBlank(message = "Institution code is required")
    private String code;

    private String type;
    private String email;
    private String phone;
    private String address;
    private String website;
    private String logoUrl;

    @NotBlank(message = "Admin first name is required")
    private String adminFirstName;

    @NotBlank(message = "Admin last name is required")
    private String adminLastName;

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid admin email format")
    private String adminEmail;

    @NotBlank(message = "Admin password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String adminPassword;
}
