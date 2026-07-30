package com.rems.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String phone;

    @NotNull(message = "roleId is required")
    private Integer roleId;

    // Both optional — null if the person doesn't belong to any institution/department yet.
    // If institutionId is set, it must reference an ACTIVE (approved) institution.
    // If departmentId is set, institutionId must also be set, and the department must
    // belong to that same institution.
    private Long institutionId;

    private Long departmentId;

    private Long labId;
}
