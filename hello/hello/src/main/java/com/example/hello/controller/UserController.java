package com.example.hello.controller;

import com.example.hello.entity.User;
import com.example.hello.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUsers();
    }
}