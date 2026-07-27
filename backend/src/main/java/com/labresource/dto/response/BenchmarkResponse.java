package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Current window measured against the immediately preceding window of equal length
 * (spec: Utilization Dimension "Current Utilization vs. Historical Benchmarks").
 *
 * Comparing against the previous equal-length window — rather than an all-time average — keeps
 * the two periods the same size and adjacent, so a 30-day view is judged against the 30 days
 * before it and seasonal drift does not masquerade as a trend.
 */
@Data
@Builder
public class BenchmarkResponse {

    /** Length of each window in days; both periods use the same span. */
    private int days;

    private double currentUtilizationRate;
    private double previousUtilizationRate;
    /** currentRate - previousRate, in percentage points. */
    private double changePercentagePoints;
    /** Relative change, e.g. 25.0 for a quarter more utilization than last period. */
    private double changePercent;
    /** UP | DOWN | FLAT — FLAT absorbs rounding noise around zero. */
    private String trend;

    private long currentBookedMinutes;
    private long previousBookedMinutes;
    private long currentBookings;
    private long previousBookings;

    /** Equipment whose utilization moved most between the two windows. */
    private List<EquipmentTrend> biggestRisers;
    private List<EquipmentTrend> biggestFallers;

    /** Plain-language reading of the comparison. */
    private String summary;

    @Data
    @Builder
    public static class EquipmentTrend {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private double currentRate;
        private double previousRate;
        private double changePercentagePoints;
    }
}
