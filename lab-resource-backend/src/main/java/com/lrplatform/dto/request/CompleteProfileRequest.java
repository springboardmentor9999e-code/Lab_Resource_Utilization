package com.lrplatform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteProfileRequest {
    @NotBlank(message = "Setup token is required")
    private String setupToken;

    @NotBlank(message = "Role is required")
    private String role;

    private Long institutionId;
    private Long departmentId;
    private String customInstitutionName;
}
