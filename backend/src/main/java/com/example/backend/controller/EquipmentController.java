package com.example.backend.controller;

import com.example.backend.entity.Equipment;
import com.example.backend.service.EquipmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }


    // =========================
    // GET ALL EQUIPMENT
    // =========================

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {

        return ResponseEntity.ok(
                equipmentService.getAllEquipment()
        );
    }


    // =========================
    // GET EQUIPMENT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(
            @PathVariable Integer id
    ) {

        Equipment equipment =
                equipmentService.getEquipmentById(id);

        if (equipment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(equipment);
    }


    // =========================
    // ADD EQUIPMENT
    // =========================

    @PostMapping
    public ResponseEntity<Equipment> addEquipment(
            @RequestBody Equipment equipment
    ) {

        Equipment savedEquipment =
                equipmentService.saveEquipment(
                        equipment
                );

        return ResponseEntity.ok(
                savedEquipment
        );
    }


    // =========================
    // UPDATE EQUIPMENT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment equipment
    ) {

        equipment.setId(id);

        Equipment updatedEquipment =
                equipmentService.updateEquipment(
                        equipment
                );

        if (updatedEquipment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(
                updatedEquipment
        );
    }


    // =========================
    // DELETE EQUIPMENT
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(
            @PathVariable Integer id
    ) {

        equipmentService.deleteEquipment(id);

        return ResponseEntity.ok(
                "Equipment Deleted Successfully"
        );
    }


    // =========================
    // UPLOAD IMAGE AND DOCUMENT
    // =========================

    @PostMapping("/upload/{id}")
    public ResponseEntity<?> uploadFiles(

            @PathVariable Integer id,

            @RequestParam("image")
            MultipartFile image,

            @RequestParam("document")
            MultipartFile document

    ) throws IOException {


        Equipment equipment =
                equipmentService.getEquipmentById(id);


        if (equipment == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }


        // Create folders

        Path imageFolder =
                Paths.get("uploads/images");

        Path documentFolder =
                Paths.get("uploads/documents");


        Files.createDirectories(
                imageFolder
        );

        Files.createDirectories(
                documentFolder
        );


        // Generate unique names

        String imageName =
                UUID.randomUUID()
                        + "_"
                        + image.getOriginalFilename();


        String documentName =
                UUID.randomUUID()
                        + "_"
                        + document.getOriginalFilename();


        // Save image

        Path imagePath =
                imageFolder.resolve(
                        imageName
                );


        Files.copy(

                image.getInputStream(),

                imagePath,

                StandardCopyOption
                        .REPLACE_EXISTING
        );


        // Save document

        Path documentPath =
                documentFolder.resolve(
                        documentName
                );


        Files.copy(

                document.getInputStream(),

                documentPath,

                StandardCopyOption
                        .REPLACE_EXISTING
        );


        // Save paths in database

        equipment.setImage(

                "/uploads/images/"
                        + imageName
        );


        equipment.setDocumentUrl(

                "/uploads/documents/"
                        + documentName
        );


        equipmentService.saveEquipment(
                equipment
        );


        return ResponseEntity.ok(
                equipment
        );
    }
}