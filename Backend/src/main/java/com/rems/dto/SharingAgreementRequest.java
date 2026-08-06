package com.rems.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingAgreementRequest {

    @NotNull(message = "targetInstitutionId is required")
    private Long targetInstitutionId;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @NotNull(message = "Terms acceptance is required")
    private Boolean termsAccepted;
}
