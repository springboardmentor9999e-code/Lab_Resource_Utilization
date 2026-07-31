package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.dto.MaintenanceRequestDTO;
import com.project.Lab.Resource.Utilization.Platform.dto.MaintenanceResponseDTO;
import com.project.Lab.Resource.Utilization.Platform.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin("*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // Create Maintenance
    @PostMapping
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER')")
    public MaintenanceResponseDTO create(
            @RequestBody MaintenanceRequestDTO dto){

        return maintenanceService.create(dto);
    }

    // Get All Maintenance
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceResponseDTO> getAll(){

        return maintenanceService.getAll();
    }

    // Get Maintenance By Id
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public MaintenanceResponseDTO getById(
            @PathVariable Integer id){

        return maintenanceService.getById(id);
    }

    // Get By Equipment
    @GetMapping("/equipment/{equipmentId}")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceResponseDTO> getByEquipment(
            @PathVariable Integer equipmentId){

        return maintenanceService.getByEquipment(equipmentId);
    }

    // Get By Technician
    @GetMapping("/technician/{technicianId}")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceResponseDTO> getByTechnician(
            @PathVariable Integer technicianId){

        return maintenanceService.getByTechnician(technicianId);
    }

    // Get By Status
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public List<MaintenanceResponseDTO> getByStatus(
            @PathVariable String status){

        return maintenanceService.getByStatus(status);
    }

    // Complete Maintenance
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('LAB_TECHNICIAN','LAB_MANAGER')")
    public MaintenanceResponseDTO complete(
            @PathVariable Integer id,
            @RequestParam String remarks){

        return maintenanceService.complete(id, remarks);
    }

}