package com.project.Lab.Resource.Utilization.Platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lab-technician")
public class LabTechnicianController {

    @GetMapping("/test")
    public String test() {
        return "LAB_TECHNICIAN Access Granted";
    }
}