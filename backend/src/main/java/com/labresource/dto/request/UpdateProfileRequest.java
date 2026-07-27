package com.labresource.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Self-service profile edit. Username, roles and institution are intentionally
 * NOT editable here — only the user's own contact/name details.
 */
@Data
public class UpdateProfileRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    private String phone;

    private String gender;
}
