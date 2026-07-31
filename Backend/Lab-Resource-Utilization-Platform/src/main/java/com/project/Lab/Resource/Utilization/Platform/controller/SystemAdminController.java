package com.project.Lab.Resource.Utilization.Platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system-admin")
public class SystemAdminController {

    @GetMapping("/test")
    public String test() {
        return "SYSTEM_ADMIN Access Granted";
    }
}