package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.Equipment;
import com.project.Lab.Resource.Utilization.Platform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    // ==========================================================
    // CREATE EQUIPMENT
    // Institution Admin & System Admin
    // ==========================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public Equipment createEquipment(@RequestBody Equipment equipment) {
        return equipmentService.saveEquipment(equipment);
    }

    // ==========================================================
    // GET ALL EQUIPMENT
    // All Logged In Users
    // ==========================================================
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    // ==========================================================
    // GET EQUIPMENT DETAILS
    // All Logged In Users
    // ==========================================================
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public Equipment getEquipmentById(@PathVariable Integer id) {
        return equipmentService.getEquipmentById(id);
    }

    // ==========================================================
    // SEARCH EQUIPMENT
    // All Logged In Users
    // ==========================================================
    @GetMapping("/search")
    @PreAuthorize("isAuthenticated()")
    public List<Equipment> searchEquipment(@RequestParam String name) {
        return equipmentService.searchEquipment(name);
    }

    // ==========================================================
    // FILTER BY STATUS
    // All Logged In Users
    // ==========================================================
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public List<Equipment> getEquipmentByStatus(
            @PathVariable String status) {

        return equipmentService.getEquipmentByStatus(status);
    }

    // ==========================================================
    // DASHBOARD
    // All Logged In Users
    // ==========================================================
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public Map<String, Long> getDashboard() {
        return equipmentService.getEquipmentDashboard();
    }

    // ==========================================================
    // UPDATE EQUIPMENT
    // Institution Admin & System Admin
    // ==========================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public Equipment updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment equipment) {

        return equipmentService.updateEquipment(id, equipment);
    }

    // ==========================================================
    // DELETE EQUIPMENT
    // Institution Admin & System Admin
    // ==========================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTITUTION_ADMIN','SYSTEM_ADMIN')")
    public String deleteEquipment(@PathVariable Integer id) {

        equipmentService.deleteEquipment(id);

        return "Equipment deleted successfully";
    }

}