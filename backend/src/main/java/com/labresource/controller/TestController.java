package com.labresource.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/any")
    public String testAny() {
        return "Access granted: You are authenticated!";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String testAdmin() {
        return "Access granted: You have ADMIN role!";
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public String testStudent() {
        return "Access granted: You have STUDENT role!";
    }
}
