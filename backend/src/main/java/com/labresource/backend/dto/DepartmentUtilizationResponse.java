package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentUtilizationResponse {

    private String departmentName;

    private Long totalEquipment;

    private Long equipmentInUse;

    private Double utilizationPercentage;

}