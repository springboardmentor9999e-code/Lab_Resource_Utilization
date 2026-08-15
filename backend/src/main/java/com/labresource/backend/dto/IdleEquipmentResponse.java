package com.labresource.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IdleEquipmentResponse {

    private Long equipmentId;

    private String equipmentName;

    private String laboratoryName;

    private String institutionName;

    private String lastUsed;

    private Long idleDays;

    private String alert;

}