package com.labresource.platform.dto;

import com.labresource.platform.entity.Equipment;
import com.labresource.platform.entity.Maintenance;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.entity.User;
import java.time.LocalDateTime;

public record MaintenanceResponse(
        Long id,
        Long equipmentId,
        String equipmentName,
        String title,
        String description,
        MaintenanceStatus status,
        LocalDateTime scheduledStartTime,
        LocalDateTime scheduledEndTime,
        LocalDateTime actualStartTime,
        LocalDateTime actualEndTime,
        String technicianName,
        String notes,
        Long createdByUserId,
        String createdByName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static MaintenanceResponse from(Maintenance maintenance) {
        Equipment equipment = maintenance.getEquipment();
        User createdBy = maintenance.getCreatedBy();

        return new MaintenanceResponse(
                maintenance.getId(),
                equipment.getId(),
                equipment.getName(),
                maintenance.getTitle(),
                maintenance.getDescription(),
                maintenance.getStatus(),
                maintenance.getScheduledStartTime(),
                maintenance.getScheduledEndTime(),
                maintenance.getActualStartTime(),
                maintenance.getActualEndTime(),
                maintenance.getTechnicianName(),
                maintenance.getNotes(),
                createdBy.getId(),
                createdBy.getFirstName() + " " + createdBy.getLastName(),
                maintenance.getCreatedAt(),
                maintenance.getUpdatedAt()
        );
    }
}
