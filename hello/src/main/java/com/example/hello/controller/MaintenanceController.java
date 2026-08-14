package com.example.hello.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.hello.entity.Maintenance;
import com.example.hello.service.MaintenanceService;

@RestController
@RequestMapping("/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    @Autowired
    private MaintenanceService service;

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return service.getAllMaintenance();
    }

    @PostMapping
    public Maintenance addMaintenance(
            @RequestBody Maintenance maintenance) {

        return service.saveMaintenance(maintenance);
    }

    @PutMapping("/{id}")
    public Maintenance updateMaintenance(
            @PathVariable Integer id,
            @RequestBody Maintenance maintenance) {

        maintenance.setMaintenanceId(id);

        return service.saveMaintenance(maintenance);
    }

    @DeleteMapping("/{id}")
    public void deleteMaintenance(
            @PathVariable Integer id) {

        service.deleteMaintenance(id);
    }
}