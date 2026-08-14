package com.example.hello.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.hello.entity.Equipment;
import com.example.hello.service.CurrentUserService;
import com.example.hello.service.EquipmentService;

@RestController
@RequestMapping("/equipment")
@CrossOrigin(origins = "http://localhost:3000")
public class EquipmentController {

    @Autowired
    private EquipmentService service;

    @Autowired
    private CurrentUserService currentUserService;


    // =========================================================
    // GET EQUIPMENT
    // =========================================================

    @GetMapping
    public List<Equipment> getAllEquipment(
            Authentication authentication) {

        String role = authentication
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // -----------------------------------------------------
        // SYSTEM ADMIN
        // -----------------------------------------------------

        if (role.equals("SYSTEM_ADMIN")) {

            return service.getAllEquipment();
        }


        // -----------------------------------------------------
        // INSTITUTION ADMIN
        // -----------------------------------------------------

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(authentication);

            return service.getEquipmentByInstitution(
                    institutionId
            );
        }


        // -----------------------------------------------------
        // DEPARTMENT HEAD
        // -----------------------------------------------------

        if (role.equals("DEPARTMENT_HEAD")) {

            Integer departmentId =
                    currentUserService
                            .getCurrentDepartmentId(authentication);

            return service.getEquipmentByDepartment(
                    departmentId
            );
        }


        // -----------------------------------------------------
        // RESEARCHER
        // Researchers need to see equipment
        // so they can book shared resources.
        // -----------------------------------------------------

        if (role.equals("RESEARCHER")) {

            return service.getAllEquipment();
        }


        // -----------------------------------------------------
        // OTHER ROLES
        // -----------------------------------------------------

        return List.of();
    }


    // =========================================================
    // ADD EQUIPMENT
    // =========================================================

    @PostMapping
    public Equipment addEquipment(
            @RequestBody Equipment equipment,
            Authentication authentication) {

        String role = authentication
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // -----------------------------------------------------
        // DEPARTMENT HEAD
        // Force equipment to their department and institution
        // -----------------------------------------------------

        if (role.equals("DEPARTMENT_HEAD")) {

            Integer departmentId =
                    currentUserService
                            .getCurrentDepartmentId(authentication);

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(authentication);

            equipment.setDepartmentId(departmentId);

            equipment.setInstitutionId(institutionId);
        }


        // -----------------------------------------------------
        // INSTITUTION ADMIN
        // Force equipment to their institution
        // -----------------------------------------------------

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(authentication);

            equipment.setInstitutionId(institutionId);
        }


        return service.saveEquipment(equipment);
    }


    // =========================================================
    // UPDATE EQUIPMENT
    // =========================================================

    @PutMapping("/{id}")
    public Equipment updateEquipment(
            @PathVariable Integer id,
            @RequestBody Equipment equipment,
            Authentication authentication) {

        String role = authentication
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // -----------------------------------------------------
        // DEPARTMENT HEAD
        // Keep equipment inside their department/institution
        // -----------------------------------------------------

        if (role.equals("DEPARTMENT_HEAD")) {

            Integer departmentId =
                    currentUserService
                            .getCurrentDepartmentId(authentication);

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(authentication);

            equipment.setDepartmentId(departmentId);

            equipment.setInstitutionId(institutionId);
        }


        // -----------------------------------------------------
        // INSTITUTION ADMIN
        // Keep equipment inside their institution
        // -----------------------------------------------------

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(authentication);

            equipment.setInstitutionId(institutionId);
        }


        equipment.setEquipmentId(id);

        return service.saveEquipment(equipment);
    }


    // =========================================================
    // DELETE EQUIPMENT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipment(
            @PathVariable Integer id,
            Authentication authentication) {

        try {

            service.deleteEquipment(id);

            return ResponseEntity.ok(
                    "Equipment deleted successfully."
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(e.getMessage());
        }
    }
}