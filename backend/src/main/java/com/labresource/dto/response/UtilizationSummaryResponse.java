package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class UtilizationSummaryResponse {

    private int days;
    private double overallUtilizationRate;
    private long totalBookedMinutes;
    private long totalUsedMinutes;
    private long totalBookings;
    private long equipmentCount;
    private long idleEquipmentCount;
    private List<EquipmentUtilizationResponse> equipment;
    private List<EquipmentUtilizationResponse> mostUtilized;   // top 5 by rate
    private List<EquipmentUtilizationResponse> leastUtilized;  // bottom 5 by rate
    private Map<String, Double> departmentUtilization;         // department name -> avg rate
    private Map<String, Double> institutionUtilization;        // institution name -> avg rate

    // ---- Utilization dimension: Department vs. Institutional Targets ----
    private List<TargetComparisonResponse> departmentTargets;
    private List<TargetComparisonResponse> institutionTargets;

    // ---- Utilization dimension: Current vs. Historical Benchmarks ----
    /** The same metrics over the immediately preceding window of equal length. */
    private BenchmarkResponse benchmark;

    // ---- Utilization dimension: Shared vs. Exclusive Usage Patterns ----
    private SharedUsageResponse sharedUsage;
}
