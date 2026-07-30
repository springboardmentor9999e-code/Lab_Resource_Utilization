package com.labhub.service;

import com.labhub.entity.Maintenance;
import com.labhub.enums.MaintenanceStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MaintenanceService {
    Maintenance createRequest(String userEmail, UUID equipmentId, String type, String description, LocalDate scheduledDate, Double cost, LocalDate startDate, UUID technicianId);
    List<Maintenance> getAllMaintenance(String userEmail);
    Maintenance approveRequest(UUID maintenanceId, String userEmail);
    Maintenance rejectRequest(UUID maintenanceId, String reason, String userEmail);
    Maintenance completeMaintenance(UUID maintenanceId, String notes, String userEmail);
    Maintenance updateStatus(UUID maintenanceId, MaintenanceStatus status, String notes, String userEmail);
}
