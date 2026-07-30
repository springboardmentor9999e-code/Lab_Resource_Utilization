package com.labhub.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdleEquipmentResponse {
    private UUID equipmentId;
    private String equipmentName;
    private String departmentName;
    private LocalDateTime lastUsedDate;
    private long daysIdle;
    private double utilizationPercentage;
    private String status; // Highly Utilized, Moderately Utilized, Low Utilization, Idle Equipment
}
