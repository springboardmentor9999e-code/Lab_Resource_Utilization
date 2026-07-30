package com.example.labresourceplatform.controller;

import com.example.labresourceplatform.entity.Institution;
import com.example.labresourceplatform.service.InstitutionService;

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
        return institutionService.saveInstitution(institution);
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return institutionService.getAllInstitutions();
    }
}