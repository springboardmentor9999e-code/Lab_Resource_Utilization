package com.labresource.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UtilizationStats {
    private Long equipmentId;
    private String equipmentName;
    private String category;
    private long totalBookings;
    private double bookedHours;
    private double utilizationRate;
    private String usageLevel;
    private long idleDays;      // NEW — days since last confirmed use (or since creation, if never used)
    private boolean idleAlert;  // NEW — true if idleDays exceeds threshold
}