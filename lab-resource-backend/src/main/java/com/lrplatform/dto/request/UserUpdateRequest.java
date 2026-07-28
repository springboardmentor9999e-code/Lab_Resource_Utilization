package com.lrplatform.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;

    @Email(message = "Please provide a valid email")
    private String email;

    @Size(max = 20)
    private String phone;

    private Long institutionId;

    private Long departmentId;
}
