package com.example.backend.controller;

import com.example.backend.entity.Laboratory;
import com.example.backend.service.LaboratoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
@CrossOrigin(origins = "*")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @PostMapping
    public Laboratory saveLaboratory(@RequestBody Laboratory laboratory) {
        return laboratoryService.saveLaboratory(laboratory);
    }

    @GetMapping
    public List<Laboratory> getAllLaboratories() {
        return laboratoryService.getAllLaboratories();
    }

    @GetMapping("/{id}")
    public Laboratory getLaboratoryById(@PathVariable Integer id) {
        return laboratoryService.getLaboratoryById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteLaboratory(@PathVariable Integer id) {
        laboratoryService.deleteLaboratory(id);
        return "Laboratory deleted successfully";
    }
}