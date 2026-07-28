package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryResponse {
    private BigDecimal totalBudget;
    private BigDecimal totalSpent;
    private BigDecimal totalRemaining;
    private double utilizationPercent;
    private List<DepartmentBudget> departmentBudgets;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentBudget {
        private Long departmentId;
        private String departmentName;
        private BigDecimal budgetAmount;
        private BigDecimal spentAmount;
        private BigDecimal remaining;
        private double utilizationPercent;
        private int invoiceCount;
    }
}
