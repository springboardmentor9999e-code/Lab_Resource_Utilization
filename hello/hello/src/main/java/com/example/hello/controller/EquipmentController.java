package com.example.hello.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.hello.entity.Equipment;
import com.example.hello.service.EquipmentService;

@RestController
@RequestMapping("/equipment")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    @Autowired
    private EquipmentService service;

    @GetMapping
    public List<Equipment> getAllEquipment() {
        return service.getAllEquipment();
    }

    @PostMapping
    public Equipment addEquipment(@RequestBody Equipment equipment) {
        return service.saveEquipment(equipment);
    }
    @PutMapping("/{id}")
    public Equipment updateEquipment(@PathVariable Integer id,
                                     @RequestBody Equipment equipment) {

        equipment.setEquipmentId(id);

        return service.saveEquipment(equipment);
    }

    @DeleteMapping("/{id}")
    public void deleteEquipment(@PathVariable Integer id) {
        service.deleteEquipment(id);
    }
}