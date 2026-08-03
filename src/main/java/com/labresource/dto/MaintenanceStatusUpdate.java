package com.labresource.dto;

import com.labresource.entity.MaintenanceStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaintenanceStatusUpdate {
    private MaintenanceStatus status;
    private String notes;
}