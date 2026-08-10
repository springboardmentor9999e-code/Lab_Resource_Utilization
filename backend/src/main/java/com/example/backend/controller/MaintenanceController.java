package com.example.backend.controller;

import com.example.backend.entity.Maintenance;
import com.example.backend.service.MaintenanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceController {

    private final MaintenanceService service;

    public MaintenanceController(MaintenanceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Maintenance> getAll() {
        return service.getAllMaintenance();
    }

    @GetMapping("/{id}")
    public Maintenance getById(@PathVariable Integer id) {
        return service.getMaintenanceById(id);
    }

    @PostMapping
    public Maintenance save(@RequestBody Maintenance maintenance) {
        return service.saveMaintenance(maintenance);
    }

    @PutMapping("/{id}")
    public Maintenance update(@PathVariable Integer id,
                              @RequestBody Maintenance maintenance) {
        return service.updateMaintenance(id, maintenance);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id) {
        service.deleteMaintenance(id);
        return "Maintenance Deleted Successfully";
    }
}