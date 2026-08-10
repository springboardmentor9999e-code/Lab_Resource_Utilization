package com.example.backend.controller;

import com.example.backend.dto.UtilizationStatsDTO;
import com.example.backend.entity.Equipment;
import com.example.backend.entity.Utilization;
import com.example.backend.service.UtilizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/utilization")
@CrossOrigin(origins = "http://localhost:3000")
public class UtilizationController {

    private final UtilizationService utilizationService;

    public UtilizationController(UtilizationService utilizationService) {
        this.utilizationService = utilizationService;
    }

    @GetMapping
    public List<Utilization> getAllUtilizations() {
        return utilizationService.getAllUtilizations();
    }

    @GetMapping("/stats")
    public ResponseEntity<UtilizationStatsDTO> getUtilizationStats() {
        return ResponseEntity.ok(utilizationService.getUtilizationStats());
    }

    @GetMapping("/idle")
    public ResponseEntity<List<Equipment>> getIdleEquipment() {
        return ResponseEntity.ok(utilizationService.getIdleEquipment());
    }

    @GetMapping("/{id}")
    public Optional<Utilization> getUtilizationById(@PathVariable Long id) {
        return utilizationService.getUtilizationById(id);
    }

    @PostMapping
    public Utilization createUtilization(@RequestBody Utilization utilization) {
        return utilizationService.saveUtilization(utilization);
    }

    @PutMapping("/{id}")
    public Utilization updateUtilization(@PathVariable Long id,
                                         @RequestBody Utilization utilization) {
        return utilizationService.updateUtilization(id, utilization);
    }

    @DeleteMapping("/{id}")
    public void deleteUtilization(@PathVariable Long id) {
        utilizationService.deleteUtilization(id);
    }
}