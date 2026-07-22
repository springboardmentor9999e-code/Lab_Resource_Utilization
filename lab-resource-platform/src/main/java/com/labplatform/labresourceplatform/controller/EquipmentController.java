package com.labplatform.labresourceplatform.controller;

import com.labplatform.labresourceplatform.entity.Equipment;
import com.labplatform.labresourceplatform.service.EquipmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService){
        this.equipmentService = equipmentService;
    }

    // All roles can read equipment (per Role-Operation Matrix, every role has at least Read).
    // Optional labId/institutionId params let the UI filter the list without
    // fetching everything and filtering client-side.
    @GetMapping
    public List<Equipment> getAllEquipment(
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) Long institutionId){
        return equipmentService.getEquipment(labId, institutionId);
    }

    @GetMapping("/{id}")
    public Equipment getEquipmentById(@PathVariable Long id){
        return equipmentService.getEquipmentById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER')")
    public Equipment createEquipment(@RequestBody Equipment equipment){
        return equipmentService.createEquipment(equipment);
    }

    // LAB_TECHNICIAN may only update status (e.g. Available/Under Maintenance), per the matrix.
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER', 'LAB_TECHNICIAN')")
    public Equipment updateEquipmentStatus(@PathVariable Long id, @RequestBody Map<String, String> body){
        return equipmentService.updateEquipmentStatus(id, body.get("status"));
    }

    // Full field update is reserved for roles with Full CRUD on Equipment.
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER')")
    public Equipment updateEquipment(@PathVariable Long id, @RequestBody Equipment equipment){
        return equipmentService.updateEquipment(id, equipment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'INSTITUTION_ADMINISTRATOR', 'LAB_MANAGER')")
    public void deleteEquipment(@PathVariable Long id){
        equipmentService.deleteEquipment(id);
    }
}
