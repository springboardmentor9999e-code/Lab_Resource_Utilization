package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalytics {
    private long totalEquipment;
    private long availableEquipment;
    private long inUseEquipment;
    private long maintenanceEquipment;
    private long totalBookings;
    private long completedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private long noShowBookings;
    private double utilizationRate;
    private List<UtilizationDataPoint> utilizationTrend;
    private List<DepartmentStats> departmentStats;
}
