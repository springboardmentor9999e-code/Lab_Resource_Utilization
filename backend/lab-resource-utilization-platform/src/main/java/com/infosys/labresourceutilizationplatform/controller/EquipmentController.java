package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    // Add Equipment
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment));
    }

    // Get Equipment (supports filters)
    @GetMapping
    public ResponseEntity<List<Equipment>> getEquipment(

            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        if (laboratoryId != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByLaboratory(laboratoryId));
        }

        if (category != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByCategory(category));
        }

        if (status != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByStatus(status));
        }

        if (search != null) {
            return ResponseEntity.ok(
                    equipmentService.searchEquipment(search));
        }

        return ResponseEntity.ok(
                equipmentService.getAllEquipment());
    }

    // Get Equipment By ID
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentById(id));
    }

    // Update Equipment
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Long id,
            @RequestBody Equipment equipment) {

        return ResponseEntity.ok(
                equipmentService.updateEquipment(id, equipment));
    }

    // Delete Equipment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Long id) {

        equipmentService.deleteEquipment(id);

        return ResponseEntity.ok("Equipment deleted successfully.");
    }
}