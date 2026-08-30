package com.example.labresourceplatform.controller;

import com.example.labresourceplatform.entity.Maintenance;
import com.example.labresourceplatform.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @PostMapping
    public Maintenance saveMaintenance(@RequestBody Maintenance maintenance) {
        return maintenanceService.saveMaintenance(maintenance);
    }

    @GetMapping("/notifications")
    public List<Maintenance> getMaintenanceNotifications() {
        return maintenanceService.getDueTomorrowMaintenance();
    }
}