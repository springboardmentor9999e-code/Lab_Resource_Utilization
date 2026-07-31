package com.project.Lab.Resource.Utilization.Platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/department-head")
public class DepartmentHeadController {

    @GetMapping("/test")
    public String test() {
        return "DEPARTMENT_HEAD Access Granted";
    }
}