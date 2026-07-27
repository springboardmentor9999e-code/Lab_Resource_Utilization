package com.labresource.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EquipmentUtilizationResponse {

    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private String status;
    private String departmentName;
    private String institutionName;
    private String labName;
    private long bookingCount;
    private long bookedMinutes;
    private long usedMinutes;
    private double utilizationRate; // % of operating capacity (08:00-20:00), 1 decimal, capped at 100
}
