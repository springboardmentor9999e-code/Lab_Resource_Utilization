package com.lab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SharingAgreementDTO {
    private String title;
    private String agreementNumber;
    private Long providerLaboratoryId;
    private Long requestingLaboratoryId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String terms;
    private Integer sharingQuota;
    private String status;
}
