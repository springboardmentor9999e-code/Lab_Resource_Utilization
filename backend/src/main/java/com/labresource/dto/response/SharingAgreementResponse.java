package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SharingAgreementResponse {

    private Long agreementId;

    private Long fromInstitutionId;
    private String fromInstitutionName;
    private Long toInstitutionId;
    private String toInstitutionName;

    private String title;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal discountPercent;
    private Integer maxHoursPerMonth;
    private Boolean autoApprove;
    private String terms;

    private String createdByName;
    private String approvedByName;
    private LocalDateTime createdAt;

    /** ACTIVE and inside its date window right now — the only state that affects a request. */
    private boolean effective;

    /** Hours already consumed under this agreement in the current calendar month. */
    private double hoursUsedThisMonth;
    /** Remaining quota, or null when the agreement sets no cap. */
    private Double hoursRemainingThisMonth;
}
