package com.labresource.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class InterInstitutionSharingRequest {

    private String resourceType;

    private Long laboratoryId;

    private Long equipmentId;

    private Long fromInstitutionId;

    private Long toInstitutionId;

    private Integer sharedQuantity;

    private LocalDate availableFrom;

    private LocalDate availableTo;

    private String status;

    private String remarks;
}