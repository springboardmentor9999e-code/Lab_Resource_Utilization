package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InstitutionUtilizationResponse {

    private Long institutionId;
    private String institutionName;
    private Long totalEquipment;
    private Double utilizationPercentage;

}