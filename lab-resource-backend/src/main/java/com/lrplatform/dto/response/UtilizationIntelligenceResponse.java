package com.lrplatform.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilizationIntelligenceResponse {
    private double overallUtilizationRate;
    private double overallSessionFrequency;
    private long totalOperatingDays;
    private String dateRangeStart;
    private String dateRangeEnd;
    private List<EquipmentUtilization> equipmentUtilizations;
    private List<DepartmentUtilization> departmentUtilizations;
    private List<IdleEquipment> idleEquipment;
    private PeakUsageInfo peakUsage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EquipmentUtilization {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private double utilizationRate;
        private double sessionFrequency;
        private long totalBookings;
        private long totalBookedHours;
        private long totalAvailableHours;
        private int maxDailyHours;
        private long operatingDays;
        private double efficiencyScore;
        private String status;
        private List<SlotOccupancy> slotOccupancy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlotOccupancy {
        private int hour;
        private String label;
        private double occupancyPercent;
        private long bookingCount;
        private long daysBooked;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentUtilization {
        private Long departmentId;
        private String departmentName;
        private double utilizationRate;
        private long totalEquipment;
        private long totalBookings;
        private long totalBookedHours;
        private long totalAvailableHours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IdleEquipment {
        private Long equipmentId;
        private String equipmentName;
        private String equipmentCode;
        private int idleDays;
        private String lastBookingDate;
        private String departmentName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeakUsageInfo {
        private String peakHour;
        private String peakDay;
        private long peakBookings;
        private List<HourlyDistribution> hourlyDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyDistribution {
        private int hour;
        private long bookingCount;
        private double occupancyPercent;
    }
}
