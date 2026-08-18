package com.lab.backend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/labs")
public class LabController {


    @GetMapping("/test")
    public String test(){

        return "JWT Authentication Working Successfully";
    }


    @GetMapping("/hello")
    public String hello(){

        return "Welcome to Lab Management System";
    }

}