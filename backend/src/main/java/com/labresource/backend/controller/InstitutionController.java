package com.labresource.backend.controller;

import com.labresource.backend.entity.Institution;
import com.labresource.backend.service.InstitutionService;
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

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }

    @GetMapping("/{id}")
    public Institution getInstitution(@PathVariable Long id) {
        return institutionService.getInstitutionById(id);
    }

    @PostMapping
    public Institution createInstitution(@RequestBody Institution institution) {
        return institutionService.createInstitution(institution);
    }

    @PutMapping("/{id}")
    public Institution updateInstitution(
            @PathVariable Long id,
            @RequestBody Institution institution) {

        return institutionService.updateInstitution(id, institution);
    }

    @DeleteMapping("/{id}")
    public void deleteInstitution(@PathVariable Long id) {
        institutionService.deleteInstitution(id);
    }
}