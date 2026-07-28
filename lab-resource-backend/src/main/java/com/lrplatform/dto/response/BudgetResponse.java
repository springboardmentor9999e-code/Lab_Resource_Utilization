package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long departmentId;
    private String departmentName;
    private Integer fiscalYear;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remaining;
    private double utilizationPercent;
    private int invoiceCount;
    private String description;
}
