package com.labresource.platform.controller;

import com.labresource.platform.dto.CreateEquipmentRequest;
import com.labresource.platform.dto.EquipmentResponse;
import com.labresource.platform.dto.UpdateEquipmentRequest;
import com.labresource.platform.entity.EquipmentStatus;
import com.labresource.platform.service.EquipmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public EquipmentResponse createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        return equipmentService.createEquipment(request);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<EquipmentResponse> getEquipment(
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) EquipmentStatus status
    ) {
        if (labId != null && status != null) {
            return equipmentService.getEquipmentByLabAndStatus(labId, status);
        }

        if (labId != null) {
            return equipmentService.getEquipmentByLab(labId);
        }

        if (status != null) {
            return equipmentService.getEquipmentByStatus(status);
        }

        return equipmentService.getAllEquipment();
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public EquipmentResponse getEquipmentById(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public EquipmentResponse updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEquipmentRequest request
    ) {
        return equipmentService.updateEquipment(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('ROLE_SYSTEM_ADMIN')")
    public void deleteEquipment(@PathVariable Long id) {
        equipmentService.deleteEquipment(id);
    }
}
