package com.lab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentCostResponse {
    private String department;
    private BigDecimal totalCost;
    private Integer equipmentCount;
    private BigDecimal averageCost;
}
