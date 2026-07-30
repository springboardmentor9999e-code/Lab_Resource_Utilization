package com.infosys.labresourceutilizationplatform.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/student")
    public String student() {
        return "Student Login Success";
    }

    @GetMapping("/admin")
    public String admin() {
        return "Admin Login Success";
    }

    @GetMapping("/manager")
    public String manager() {
        return "Manager Login Success";
    }

    @GetMapping("/researcher")
    public String researcher() {
        return "Researcher Login Success";
    }
}