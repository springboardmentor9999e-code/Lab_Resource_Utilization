package com.labresource.platform.controller;

import com.labresource.platform.dto.CreateMaintenanceRequest;
import com.labresource.platform.dto.MaintenanceResponse;
import com.labresource.platform.dto.UpdateMaintenanceRequest;
import com.labresource.platform.entity.MaintenanceStatus;
import com.labresource.platform.service.MaintenanceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse createMaintenance(
            @Valid @RequestBody CreateMaintenanceRequest request,
            Authentication authentication
    ) {
        return maintenanceService.createMaintenance(request, authentication);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceResponse> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse getMaintenanceById(@PathVariable Long id) {
        return maintenanceService.getMaintenanceById(id);
    }

    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceResponse> getMaintenanceByEquipment(@PathVariable Long equipmentId) {
        return maintenanceService.getMaintenanceByEquipment(equipmentId);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_HOD', 'ROLE_SYSTEM_ADMIN')")
    public List<MaintenanceResponse> getMaintenanceByStatus(@PathVariable MaintenanceStatus status) {
        return maintenanceService.getMaintenanceByStatus(status);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaintenanceRequest request
    ) {
        return maintenanceService.updateMaintenance(id, request);
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse startMaintenance(@PathVariable Long id) {
        return maintenanceService.startMaintenance(id);
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse completeMaintenance(@PathVariable Long id) {
        return maintenanceService.completeMaintenance(id);
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_LAB_ASSISTANT', 'ROLE_SYSTEM_ADMIN')")
    public MaintenanceResponse cancelMaintenance(@PathVariable Long id) {
        return maintenanceService.cancelMaintenance(id);
    }
}
