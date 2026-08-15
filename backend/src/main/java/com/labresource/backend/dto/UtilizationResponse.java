package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UtilizationResponse {

    private Long totalEquipment;
    private Long equipmentInUse;
    private Long availableEquipment;
    private Long maintenanceEquipment;
    private Long idleEquipment;
    private Double averageUtilization;
}