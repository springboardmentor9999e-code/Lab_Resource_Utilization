package com.example.hello.controller;

import com.example.hello.entity.Department;
import com.example.hello.service.DepartmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
@CrossOrigin(origins = "http://localhost:3000")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentService departmentService) {

        this.departmentService = departmentService;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @PostMapping
    public Department saveDepartment(
            @RequestBody Department department) {

        return departmentService.saveDepartment(department);
    }

    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable Integer id,
            @RequestBody Department department) {

        department.setDepartmentId(id);

        return departmentService.saveDepartment(department);
    }

    @GetMapping("/{id}")
    public Department getDepartmentById(@PathVariable Integer id) {

        return departmentService.getDepartmentById(id);

    }

}