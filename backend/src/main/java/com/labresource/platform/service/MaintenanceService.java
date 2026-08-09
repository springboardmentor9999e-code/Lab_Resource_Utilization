package com.labresource.platform.service;

import com.labresource.platform.dto.CreateMaintenanceRequest;
import com.labresource.platform.dto.MaintenanceResponse;
import com.labresource.platform.dto.UpdateMaintenanceRequest;
import com.labresource.platform.entity.MaintenanceStatus;
import java.util.List;
import org.springframework.security.core.Authentication;

public interface MaintenanceService {

    MaintenanceResponse createMaintenance(CreateMaintenanceRequest request, Authentication authentication);

    List<MaintenanceResponse> getAllMaintenance();

    MaintenanceResponse getMaintenanceById(Long id);

    List<MaintenanceResponse> getMaintenanceByEquipment(Long equipmentId);

    List<MaintenanceResponse> getMaintenanceByStatus(MaintenanceStatus status);

    MaintenanceResponse updateMaintenance(Long id, UpdateMaintenanceRequest request);

    MaintenanceResponse startMaintenance(Long id);

    MaintenanceResponse completeMaintenance(Long id);

    MaintenanceResponse cancelMaintenance(Long id);
}
