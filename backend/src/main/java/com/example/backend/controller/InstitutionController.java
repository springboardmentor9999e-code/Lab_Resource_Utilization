package com.example.backend.controller;

import com.example.backend.entity.Institution;
import com.example.backend.repository.InstitutionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutions")
@CrossOrigin(origins = "http://localhost:3000")
public class InstitutionController {

    private final InstitutionRepository repository;

    public InstitutionController(InstitutionRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Institution> getAllInstitutions() {
        return repository.findAll();
    }

    @PostMapping
    public Institution addInstitution(@RequestBody Institution institution) {
        return repository.save(institution);
    }
}