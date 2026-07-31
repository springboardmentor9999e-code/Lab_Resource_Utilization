package com.project.Lab.Resource.Utilization.Platform.controller;

import com.project.Lab.Resource.Utilization.Platform.entity.Department;
import com.project.Lab.Resource.Utilization.Platform.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }
}