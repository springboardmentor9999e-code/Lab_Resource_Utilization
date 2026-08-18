package com.lab.backend.controller;

import com.lab.backend.entity.Institution;
import com.lab.backend.service.InstitutionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    private final InstitutionService institutionService;

    public InstitutionController(InstitutionService institutionService) {
        this.institutionService = institutionService;
    }

    @PostMapping
    public ResponseEntity<Institution> createInstitution(@Valid @RequestBody Institution institution) {
        return ResponseEntity.ok(institutionService.createInstitution(institution));
    }

    @GetMapping
    public ResponseEntity<List<Institution>> getAllInstitutions() {
        return ResponseEntity.ok(institutionService.getAllInstitutions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Institution> getInstitutionById(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.getInstitutionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Institution> updateInstitution(@PathVariable Long id, @Valid @RequestBody Institution institution) {
        return ResponseEntity.ok(institutionService.updateInstitution(id, institution));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitution(@PathVariable Long id) {
        institutionService.deleteInstitution(id);
        return ResponseEntity.noContent().build();
    }
}
