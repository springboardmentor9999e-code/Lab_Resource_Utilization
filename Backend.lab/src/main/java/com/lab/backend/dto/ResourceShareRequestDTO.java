package com.lab.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ResourceShareRequestDTO {

    private Long requestedById;
    private Long equipmentId;
    private Long sourceLaboratoryId;
    private Long targetLaboratoryId;

    private LocalDate startDate;
    private LocalDate endDate;
    private String purpose;
}
