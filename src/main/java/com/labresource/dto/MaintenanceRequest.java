package com.labresource.dto;

import com.labresource.entity.MaintenanceType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MaintenanceRequest {
    private Long equipmentId;
    private MaintenanceType type;
    private String description;
    private LocalDate scheduledDate;
    private String assignedTechnician;
}