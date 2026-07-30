package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Laboratory;
import com.infosys.labresourceutilizationplatform.service.LaboratoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratories")
@CrossOrigin(origins = "http://localhost:3000")
public class LaboratoryController {

    @Autowired
    private LaboratoryService laboratoryService;

    @PostMapping
    public Laboratory addLaboratory(@RequestBody Laboratory laboratory) {
        return laboratoryService.addLaboratory(laboratory);
    }

    @GetMapping
    public List<Laboratory> getLaboratories(
            @RequestParam(required = false) Long departmentId) {

        if (departmentId != null) {
            return laboratoryService.getLaboratoriesByDepartment(departmentId);
        }

        return laboratoryService.getAllLaboratories();
    }

    @GetMapping("/{id}")
    public Laboratory getLaboratoryById(@PathVariable Long id) {
        return laboratoryService.getLaboratoryById(id);
    }

    @PutMapping("/{id}")
    public Laboratory updateLaboratory(
            @PathVariable Long id,
            @RequestBody Laboratory laboratory) {

        return laboratoryService.updateLaboratory(id, laboratory);
    }

    @DeleteMapping("/{id}")
    public String deleteLaboratory(@PathVariable Long id) {

        laboratoryService.deleteLaboratory(id);

        return "Laboratory deleted successfully.";
    }
}