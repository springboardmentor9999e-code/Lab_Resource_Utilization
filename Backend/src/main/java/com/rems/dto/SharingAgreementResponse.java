package com.rems.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharingAgreementResponse {

    private Long sharingId;

    private Long requesterInstitutionId;
    private String requesterInstitutionName;
    private String requesterContactEmail;

    private Long targetInstitutionId;
    private String targetInstitutionName;
    private String targetContactEmail;

    private String status; // PENDING, APPROVED, REJECTED, REVOKED
    private Boolean termsAccepted;
    private String purpose;

    private Boolean isIncoming; // true if the logged-in admin's institution is the target

    private Instant createdAt;
    private Instant updatedAt;
}
