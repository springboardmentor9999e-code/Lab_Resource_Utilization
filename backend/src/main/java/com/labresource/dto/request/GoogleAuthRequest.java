package com.labresource.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {

    @NotBlank
    private String idToken;

    // Optional — used for role selection on OAuth signup (never SYSTEM_ADMIN / INSTITUTION_ADMIN)
    private String role;
}
