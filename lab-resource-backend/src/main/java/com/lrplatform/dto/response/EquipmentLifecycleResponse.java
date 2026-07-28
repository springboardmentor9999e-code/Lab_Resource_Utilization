package com.lrplatform.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentLifecycleResponse {
    private List<EquipmentLifecycle> equipmentLifecycles;
    private List<ProcurementRecommendation> procurementRecommendations;
    private BigDecimal totalAssetValue;
    private BigDecimal totalMaintenanceCost;
    private double averageLifecycleMonths;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentLifecycle {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private BigDecimal purchaseCost;
        private BigDecimal maintenanceCost;
        private BigDecimal totalCostOfOwnership;
        private double roi;
        private int ageMonths;
        private LocalDate purchaseDate;
        private LocalDate warrantyExpiry;
        private boolean warrantyExpired;
        private String condition;
        private int totalBookings;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcurementRecommendation {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private String reason;
        private BigDecimal currentCost;
        private String recommendation;
        private String priority;
    }
}
