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
public class CostBreakdownResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalPaid;
    private BigDecimal totalPending;
    private BigDecimal totalOverdue;
    private List<DepartmentCost> departmentCosts;
    private List<EquipmentCost> equipmentCosts;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentCost {
        private Long departmentId;
        private String departmentName;
        private BigDecimal totalCost;
        private BigDecimal costPerBooking;
        private int bookingCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentCost {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private BigDecimal totalCost;
        private BigDecimal hourlyRate;
        private int bookingCount;
    }
}
