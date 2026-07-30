package com.rems.controller;

import com.rems.dto.EquipmentRequest;
import com.rems.dto.EquipmentResponse;
import com.rems.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('view_equipment')")
    public ResponseEntity<List<EquipmentResponse>> searchEquipment(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long institutionId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long labId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(equipmentService.searchEquipment(name, institutionId, departmentId, labId, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('view_equipment')")
    public ResponseEntity<EquipmentResponse> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }
    @PostMapping("/add")
    @PreAuthorize("hasAuthority('manage_equipment')")
    public ResponseEntity<EquipmentResponse> addEquipment(@Valid @RequestBody EquipmentRequest request, Principal principal){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(equipmentService.createEquipment(request,principal.getName()));

    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('manage_equipment')")
    public ResponseEntity<Map<String, String>> deleteEquipment(@PathVariable Long id, Principal principal) {
        equipmentService.deleteEquipment(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "Equipment deleted successfully"));
    }
}
