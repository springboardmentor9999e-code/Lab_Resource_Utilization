package com.labresource.backend.controller;

import com.labresource.backend.dto.MaintenanceRequest;
import com.labresource.backend.entity.Maintenance;
import com.labresource.backend.service.MaintenanceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final UserRepository userRepository;

    public MaintenanceController(
            MaintenanceService maintenanceService,
            UserRepository userRepository) {

        this.maintenanceService = maintenanceService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return maintenanceService.getAllMaintenance();
    }

    @GetMapping("/{id}")
    public Maintenance getMaintenance(@PathVariable Long id) {
        return maintenanceService.getMaintenanceById(id);
    }

    @PostMapping
    public Maintenance createMaintenance(
            @RequestBody MaintenanceRequest request) {

        return maintenanceService.createMaintenance(request);
    }

    @PutMapping("/{id}")
    public Maintenance updateMaintenance(
            @PathVariable Long id,
            @RequestBody MaintenanceRequest request) {

        return maintenanceService.updateMaintenance(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
    }
    @GetMapping("/institution")
    public List<Maintenance> getMaintenanceByInstitution(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        return maintenanceService.getMaintenanceByInstitution(
                user.getInstitution().getInstitutionId()
        );
    }
}