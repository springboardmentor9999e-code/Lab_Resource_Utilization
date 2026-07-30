package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Institution;
import com.infosys.labresourceutilizationplatform.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "http://localhost:3000")
public class InstitutionController {

    @Autowired
    private InstitutionService institutionService;

    @PostMapping
    public Institution addInstitution(@RequestBody Institution institution) {
        return institutionService.addInstitution(institution);
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }

    @GetMapping("/{id}")
    public Institution getInstitutionById(@PathVariable Long id) {
        return institutionService.getInstitutionById(id);
    }

    @PutMapping("/{id}")
    public Institution updateInstitution(
            @PathVariable Long id,
            @RequestBody Institution institution) {

        return institutionService.updateInstitution(id, institution);
    }

    @DeleteMapping("/{id}")
    public String deleteInstitution(@PathVariable Long id) {

        institutionService.deleteInstitution(id);

        return "Institution deleted successfully.";
    }
}