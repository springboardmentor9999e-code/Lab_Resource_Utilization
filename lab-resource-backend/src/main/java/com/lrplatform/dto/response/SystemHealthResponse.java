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
public class SystemHealthResponse {
    private String status;
    private boolean databaseConnected;
    private long totalMemoryMB;
    private long usedMemoryMB;
    private long freeMemoryMB;
    private int availableProcessors;
    private long uptimeMs;
    private boolean redisConnected;
    private Map<String, String> services;

    // Advanced metrics
    private long totalUsers;
    private long activeUsers;
    private long totalBookings;
    private long activeBookings;
    private long totalEquipment;
    private long totalLabs;
    private long diskTotalGB;
    private long diskUsedGB;
    private long diskFreeGB;
    private double jvmHeapUsedMB;
    private double jvmHeapMaxMB;
    private double jvmNonHeapUsedMB;

    // API metrics
    private long totalApiRequests;
    private long avgResponseTimeMs;
    private long apiErrorCount;
    private double apiErrorRate;
}
