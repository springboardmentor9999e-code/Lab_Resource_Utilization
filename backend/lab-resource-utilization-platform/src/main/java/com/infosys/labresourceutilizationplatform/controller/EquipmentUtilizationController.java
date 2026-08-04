package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.dto.EquipmentUtilizationDto;
import com.infosys.labresourceutilizationplatform.service.EquipmentUtilizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/utilization")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentUtilizationController {

    @Autowired
    private EquipmentUtilizationService equipmentUtilizationService;

    @GetMapping("/stats")
    public ResponseEntity<?> getUtilizationStats(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        try {
            List<EquipmentUtilizationDto> stats = equipmentUtilizationService.getUtilizationStats(principal.getName());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(400).body(e.getMessage());
        }
    }
}
