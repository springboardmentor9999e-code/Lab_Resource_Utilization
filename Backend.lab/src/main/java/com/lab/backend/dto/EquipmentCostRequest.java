package com.lab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentCostRequest {
    private String equipmentName;
    private String equipmentCode;
    private String department;
    private BigDecimal monthlyCost;
    private LocalDate costEffectiveDate;
    private String description;
}
