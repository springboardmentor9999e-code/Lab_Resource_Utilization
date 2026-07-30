package com.example.labresourceplatform.controller;

import com.example.labresourceplatform.entity.Laboratory;
import com.example.labresourceplatform.service.LaboratoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
public class LaboratoryController {

    @Autowired
    private LaboratoryService laboratoryService;

    @PostMapping
    public Laboratory addLaboratory(@RequestBody Laboratory laboratory) {
        return laboratoryService.saveLaboratory(laboratory);
    }

    @GetMapping
    public List<Laboratory> getAllLaboratories() {
        return laboratoryService.getAllLaboratories();
    }

    @GetMapping("/{id}")
    public Laboratory getLaboratoryById(@PathVariable Long id) {
        return laboratoryService.getLaboratoryById(id);
    }

    @DeleteMapping("/{id}")
    public String deleteLaboratory(@PathVariable Long id) {
        laboratoryService.deleteLaboratory(id);
        return "Laboratory deleted successfully.";
    }
}