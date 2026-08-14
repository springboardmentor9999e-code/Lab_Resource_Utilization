package com.example.hello.controller;

import com.example.hello.entity.Department;
import com.example.hello.service.CurrentUserService;
import com.example.hello.service.DepartmentService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final CurrentUserService currentUserService;

    public DepartmentController(
            DepartmentService departmentService,
            CurrentUserService currentUserService) {

        this.departmentService = departmentService;
        this.currentUserService = currentUserService;
    }


    // ============================================================
    // GET DEPARTMENTS
    // ============================================================

    @GetMapping
    public List<Department> getAllDepartments(
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // ========================================================
        // SYSTEM ADMIN
        // Can see ALL departments
        // ========================================================

        if (role.equals("SYSTEM_ADMIN")) {

            return departmentService.getAllDepartments();
        }


        // ========================================================
        // INSTITUTION ADMIN
        // Can see departments of their institution
        // ========================================================

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(
                                    authentication
                            );

            return departmentService
                    .getDepartmentsByInstitution(
                            institutionId
                    );
        }


        // ========================================================
        // DEPARTMENT HEAD
        // Can see ONLY their assigned department
        // ========================================================

        if (role.equals("DEPARTMENT_HEAD")) {

            Integer departmentId =
                    currentUserService
                            .getCurrentDepartmentId(
                                    authentication
                            );

            return departmentService
                    .getDepartmentListById(
                            departmentId
                    );
        }


        // ========================================================
        // OTHER ROLES
        // ========================================================

        return List.of();
    }


    // ============================================================
    // ADD DEPARTMENT
    // ============================================================

    @PostMapping
    public Department saveDepartment(
            @RequestBody Department department,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // Only Institution Admin / System Admin
        if (!role.equals("SYSTEM_ADMIN") &&
            !role.equals("INSTITUTION_ADMIN")) {

            throw new RuntimeException(
                    "You are not authorized to add departments"
            );
        }


        // Institution Admin can only add
        // departments to their own institution

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(
                                    authentication
                            );

            if (department.getInstitution() == null) {

                throw new RuntimeException(
                        "Institution is required"
                );
            }

            department.getInstitution()
                    .setInstitutionId(
                            institutionId
                    );
        }


        return departmentService
                .saveDepartment(department);
    }


    // ============================================================
    // UPDATE DEPARTMENT
    // ============================================================

    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable Integer id,
            @RequestBody Department department,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        // Department Head cannot update departments

        if (role.equals("DEPARTMENT_HEAD")) {

            throw new RuntimeException(
                    "Department Head cannot update departments"
            );
        }


        // Institution Admin can update only
        // departments belonging to their institution

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(
                                    authentication
                            );

            Department existingDepartment =
                    departmentService
                            .getDepartmentById(id);


            if (existingDepartment.getInstitution() == null ||
                !existingDepartment
                        .getInstitution()
                        .getInstitutionId()
                        .equals(institutionId)) {

                throw new RuntimeException(
                        "You are not authorized to update this department"
                );
            }


            // Keep original institution

            department.setInstitution(
                    existingDepartment.getInstitution()
            );
        }


        department.setDepartmentId(id);

        return departmentService
                .saveDepartment(department);
    }


    // ============================================================
    // GET DEPARTMENT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public Department getDepartmentById(
            @PathVariable Integer id,
            Authentication authentication) {

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority();


        Department department =
                departmentService
                        .getDepartmentById(id);


        // ========================================================
        // INSTITUTION ADMIN
        // ========================================================

        if (role.equals("INSTITUTION_ADMIN")) {

            Integer institutionId =
                    currentUserService
                            .getCurrentInstitutionId(
                                    authentication
                            );

            if (department.getInstitution() == null ||
                !department
                        .getInstitution()
                        .getInstitutionId()
                        .equals(institutionId)) {

                throw new RuntimeException(
                        "You are not authorized to access this department"
                );
            }
        }


        // ========================================================
        // DEPARTMENT HEAD
        // Can access ONLY their own department
        // ========================================================

        if (role.equals("DEPARTMENT_HEAD")) {

            Integer departmentId =
                    currentUserService
                            .getCurrentDepartmentId(
                                    authentication
                            );

            if (!department.getDepartmentId()
                    .equals(departmentId)) {

                throw new RuntimeException(
                        "You are not authorized to access this department"
                );
            }
        }


        return department;
    }
}