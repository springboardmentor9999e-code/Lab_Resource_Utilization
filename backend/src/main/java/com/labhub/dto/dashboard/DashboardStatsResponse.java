package com.labhub.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    private long totalEquipment;
    private long activeBookings;
    private double utilizationRate;
    private long pendingRequests;
    private long totalUsers;
    private long availableEquipment;
    private long underMaintenanceEquipment;
    private long pendingRoleRequests;
}
