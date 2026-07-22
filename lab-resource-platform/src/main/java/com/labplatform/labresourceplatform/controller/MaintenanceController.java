package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Maintenance;
import com.labplatform.labresourceplatform.service.MaintenanceService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService){
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    public List<Maintenance> getAllMaintenance(){
        return maintenanceService.getAllMaintenance();
    }

    @GetMapping("/{id}")
    public Maintenance getMaintenanceById(@PathVariable Long id){
        return maintenanceService.getMaintenanceById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public Maintenance createMaintenance(@RequestBody Maintenance maintenance){
        return maintenanceService.createMaintenance(maintenance);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public Maintenance updateMaintenance(@PathVariable Long id, @RequestBody Maintenance maintenance){
        return maintenanceService.updateMaintenance(id, maintenance);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public void deleteMaintenance(@PathVariable Long id){
        maintenanceService.deleteMaintenance(id);
    }
}
