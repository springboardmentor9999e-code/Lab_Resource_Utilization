package com.labresource.controller;

import com.labresource.dto.EquipmentRequest;
import com.labresource.entity.Equipment;
import com.labresource.repository.EquipmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('LAB_MANAGER')")
    public ResponseEntity<Equipment> addEquipment(@RequestBody EquipmentRequest request) {

        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .category(request.getCategory())
                .institutionId(request.getInstitutionId())
                .description(request.getDescription())
                .imageBase64(request.getImageBase64())
                .cost(request.getCost())
                .status("AVAILABLE")
                .build();

        return ResponseEntity.ok(equipmentRepository.save(equipment));
    }
}