package com.example.hello.controller;

import com.example.hello.entity.Institution;
import com.example.hello.service.InstitutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/institution")
@CrossOrigin(origins = "http://localhost:3000")
public class InstitutionController {

    @Autowired
    private InstitutionService institutionService;
    @PutMapping("/{id}")
    public Institution updateInstitution(@PathVariable Integer id,
                                         @RequestBody Institution institution) {

        institution.setInstitutionId(id);

        return institutionService.saveInstitution(institution);
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }

    @PostMapping
    public Institution saveInstitution(@RequestBody Institution institution) {
        return institutionService.saveInstitution(institution);
    }

    @DeleteMapping("/{id}")
    public void deleteInstitution(@PathVariable Integer id) {
        institutionService.deleteInstitution(id);
    }
}