package com.infosys.labresourceutilizationplatform.controller;

import com.infosys.labresourceutilizationplatform.entity.Equipment;
import com.infosys.labresourceutilizationplatform.service.EquipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    @Autowired
    private EquipmentService equipmentService;

    // Add Equipment
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        return ResponseEntity.ok(equipmentService.addEquipment(equipment));
    }

    // Get Equipment (supports filters)
    @GetMapping
    public ResponseEntity<List<Equipment>> getEquipment(

            @RequestParam(required = false) Long laboratoryId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {

        if (laboratoryId != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByLaboratory(laboratoryId));
        }

        if (category != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByCategory(category));
        }

        if (status != null) {
            return ResponseEntity.ok(
                    equipmentService.getEquipmentByStatus(status));
        }

        if (search != null) {
            return ResponseEntity.ok(
                    equipmentService.searchEquipment(search));
        }

        return ResponseEntity.ok(
                equipmentService.getAllEquipment());
    }

    // Get Equipment By ID
    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                equipmentService.getEquipmentById(id));
    }

    // Update Equipment
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Long id,
            @RequestBody Equipment equipment) {

        return ResponseEntity.ok(
                equipmentService.updateEquipment(id, equipment));
    }

    // Delete Equipment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Long id) {

        equipmentService.deleteEquipment(id);

        return ResponseEntity.ok("Equipment deleted successfully.");
    }

    // Upload Equipment Image
    @PostMapping("/upload")
    public ResponseEntity<String> uploadEquipmentImage(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty.");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate a unique filename
            String filename = "upload-" + System.currentTimeMillis() + extension;

            java.io.File targetDir = new java.io.File("d:\\Infosys_virtual_internship\\frontend\\public\\images\\equipment");
            if (!targetDir.exists()) {
                targetDir.mkdirs();
            }

            java.io.File destFile = new java.io.File(targetDir, filename);
            file.transferTo(destFile);

            String imageUrl = "/images/equipment/" + filename;
            return ResponseEntity.ok(imageUrl);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error uploading file: " + e.getMessage());
        }
    }
}