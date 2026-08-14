package com.example.hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleController {

    @GetMapping("/admin")
    public String admin() {
        return "Welcome SYSTEM_ADMIN";
    }

    @GetMapping("/institution-admin")
    public String institution() {
        return "Welcome INSTITUTION_ADMIN";
    }

    @GetMapping("/department-head")
    public String department() {
        return "Welcome DEPARTMENT_HEAD";
    }

    @GetMapping("/manager")
    public String manager() {
        return "Welcome LAB_MANAGER";
    }

    @GetMapping("/technician")
    public String technician() {
        return "Welcome LAB_TECHNICIAN";
    }

    @GetMapping("/researcher")
    public String researcher() {
        return "Welcome RESEARCHER";
    }
}

