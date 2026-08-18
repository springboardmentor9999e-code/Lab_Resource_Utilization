package com.lab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TotalMonthlyCostResponse {
    private BigDecimal totalMonthlyCost;
    private Integer totalEquipments;
    private Integer totalDepartments;
}
