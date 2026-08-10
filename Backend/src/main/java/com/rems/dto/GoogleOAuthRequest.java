package com.rems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleOAuthRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    private Integer roleId;
    private Long institutionId;
    private Long departmentId;
    private Long labId;
}
