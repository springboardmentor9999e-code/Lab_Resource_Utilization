package com.example.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class UtilizationStatsDTO {

    private long totalEquipment;
    private long activeEquipment;
    private long idleEquipmentCount;
    private double overallUtilizationRate; // Percentage 0 - 100%
    private BigDecimal totalHoursBooked;
    private BigDecimal totalHoursUsed;
    private Map<String, Long> categoryUsageMap;
    private Map<String, Double> equipmentUtilizationRates;

    public UtilizationStatsDTO() {
    }
}
