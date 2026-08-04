package com.infosys.labresourceutilizationplatform.service;

import com.infosys.labresourceutilizationplatform.entity.PreventiveMaintenance;
import java.util.List;

public interface PreventiveMaintenanceService {
    PreventiveMaintenance scheduleMaintenance(Long equipmentId, String scheduledDate, String description);
    List<PreventiveMaintenance> getAllSchedules();
    PreventiveMaintenance updateMaintenanceStatus(Long id, String status, String remarks);
}
