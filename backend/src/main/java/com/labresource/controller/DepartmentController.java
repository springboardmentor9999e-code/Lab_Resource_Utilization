package com.labresource.controller;

import com.labresource.entity.Department;
import com.labresource.service.interfaces.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        List<Department> departments = departmentService.getAllDepartments();
        
        List<Map<String, Object>> response = departments.stream().map(dept -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("departmentId", dept.getDepartmentId());
            map.put("name", dept.getName());
            map.put("code", dept.getCode());
            map.put("annualBudget", dept.getAnnualBudget());
            map.put("utilizationTargetPercent", dept.getUtilizationTargetPercent());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
