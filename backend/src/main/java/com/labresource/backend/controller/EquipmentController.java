package com.labresource.backend.controller;

import com.labresource.backend.dto.EquipmentRequest;
import com.labresource.backend.entity.Equipment;
import com.labresource.backend.entity.Laboratory;
import com.labresource.backend.repository.LaboratoryRepository;
import com.labresource.backend.service.EquipmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.labresource.backend.entity.User;
import com.labresource.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:5173")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final LaboratoryRepository laboratoryRepository;
    private final UserRepository userRepository;

    public EquipmentController(
        EquipmentService equipmentService,
        LaboratoryRepository laboratoryRepository,
        UserRepository userRepository) {

        this.equipmentService = equipmentService;
        this.laboratoryRepository = laboratoryRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return equipmentService.getAllEquipment();
    }

    @GetMapping("/{id}")
    public Equipment getEquipment(@PathVariable Long id) {
        return equipmentService.getEquipmentById(id);
    }

    @PostMapping
    public Equipment createEquipment(@RequestBody EquipmentRequest request) {

        Laboratory laboratory = laboratoryRepository.findById(request.getLabId())
                .orElseThrow(() -> new RuntimeException("Laboratory not found"));

        Equipment equipment = new Equipment();

        equipment.setEquipmentName(request.getEquipmentName());
        equipment.setCategory(request.getCategory());
        equipment.setDescription(request.getDescription());
        equipment.setCost(request.getCost());
        equipment.setQuantity(request.getQuantity());
        equipment.setAvailableQuantity(request.getAvailableQuantity());
        equipment.setStatus(request.getStatus());
        equipment.setImage(request.getImage());
        equipment.setLaboratory(laboratory);

        return equipmentService.createEquipment(equipment);
    }

    @PutMapping("/{id}")
public Equipment updateEquipment(
        @PathVariable Long id,
        @RequestBody EquipmentRequest request,
        Authentication authentication) {

    Laboratory laboratory = laboratoryRepository.findById(request.getLabId())
            .orElseThrow(() -> new RuntimeException("Laboratory not found"));

    Equipment equipment = new Equipment();

    equipment.setEquipmentName(request.getEquipmentName());
    equipment.setCategory(request.getCategory());
    equipment.setDescription(request.getDescription());
    equipment.setCost(request.getCost());
    equipment.setQuantity(request.getQuantity());
    equipment.setAvailableQuantity(request.getAvailableQuantity());
    equipment.setStatus(request.getStatus());
    equipment.setImage(request.getImage());
    equipment.setLaboratory(laboratory);

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow();

    if ("SYSTEM_ADMIN".equals(user.getRole().getRoleName())) {

        return equipmentService.updateEquipment(id, equipment);

    } else {

        return equipmentService.updateEquipmentByInstitution(
                user.getInstitution().getInstitutionId(),
                id,
                equipment
        );
    }
}

    @DeleteMapping("/{id}")
public void deleteEquipment(
        @PathVariable Long id,
        Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow();

    if ("SYSTEM_ADMIN".equals(user.getRole().getRoleName())) {

        equipmentService.deleteEquipment(id);

    } else {

        equipmentService.deleteEquipmentByInstitution(
                user.getInstitution().getInstitutionId(),
                id
        );
    }
}


    @GetMapping("/laboratory/{labId}")
public ResponseEntity<List<Equipment>> getEquipmentByLab(
        @PathVariable Long labId) {

    return ResponseEntity.ok(
            equipmentService.getEquipmentByLab(labId)
    );

}

@GetMapping("/institution")
public List<Equipment> getEquipmentByInstitution(Authentication authentication) {

    String email = authentication.getName();

    User user = userRepository.findByEmail(email)
            .orElseThrow();

    Long institutionId = user.getInstitution().getInstitutionId();

    return equipmentService.getEquipmentByInstitution(institutionId);
}
}