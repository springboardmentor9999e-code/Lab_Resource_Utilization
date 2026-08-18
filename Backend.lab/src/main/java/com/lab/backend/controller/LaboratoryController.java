package com.lab.backend.controller;

import com.lab.backend.entity.Laboratory;
import com.lab.backend.service.LaboratoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/laboratories")
@CrossOrigin(origins = "http://localhost:5173")
public class LaboratoryController {


    private final LaboratoryService laboratoryService;


    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }



    // CREATE
    @PostMapping
    public ResponseEntity<Laboratory> create(
            @RequestBody Laboratory laboratory) {

        return ResponseEntity.ok(
                laboratoryService.createLaboratory(laboratory)
        );
    }



    // GET ALL
    @GetMapping
    public ResponseEntity<List<Laboratory>> getAll(){

        return ResponseEntity.ok(
                laboratoryService.getAllLaboratories()
        );
    }



    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Laboratory> getById(
            @PathVariable Long id){

        return ResponseEntity.ok(
                laboratoryService.getLaboratoryById(id)
        );
    }



    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<Laboratory> update(
            @PathVariable Long id,
            @RequestBody Laboratory laboratory){

        return ResponseEntity.ok(
                laboratoryService.updateLaboratory(id, laboratory)
        );
    }



    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id){

        laboratoryService.deleteLaboratory(id);

        return ResponseEntity.ok(
                "Laboratory deleted successfully"
        );
    }
}