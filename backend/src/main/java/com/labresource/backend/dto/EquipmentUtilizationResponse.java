package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentUtilizationResponse {

    private Long equipmentId;
    private String equipmentName;
    private String laboratoryName;
    private String departmentName;
    private String status;
    private Integer quantity;
    private Double utilizationPercentage;
    private String lastUsed;
    private String idleTime;

}