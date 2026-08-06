package com.rems.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstitutionDirectoryResponse {

    private Long institutionId;
    private String name;
    private String type;
    private String address;
    private String contactEmail;
    private String contactPhone;
    private String status;

    // Agreement status relative to caller's institution: NONE, PENDING, APPROVED, REJECTED
    private String agreementStatus;
    private Long agreementId;

    private Instant createdAt;
}
