package com.lrplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStats {
    private long totalUsers;
    private long totalInstitutions;
    private long totalEquipment;
    private long totalBookings;
    private long totalWorkOrders;
    private long activeUsers;
    private long inactiveUsers;
    private Map<String, Long> usersByRole;
    private Map<String, Long> equipmentByStatus;
    private Map<String, Long> bookingsByStatus;
}
